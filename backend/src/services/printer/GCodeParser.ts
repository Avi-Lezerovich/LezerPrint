export type Position = { x: number; y: number; z: number; e: number };

export interface GCodeMetadata {
	flavor?: string;
	estimatedTime?: number; // seconds
	filamentUsed?: number; // mm or grams if available
	layerHeight?: number;
}

export class GCodeParser {
	private lines: string[];
	public metadata: GCodeMetadata = {};

	constructor(gcode: string) {
		this.lines = gcode.split(/\r?\n/);
		this.parseMetadata();
	}

	private parseMetadata() {
		for (const line of this.lines) {
			if (line.includes(';FLAVOR:')) this.metadata.flavor = line.split(':')[1]?.trim();
			if (line.includes(';TIME:')) this.metadata.estimatedTime = parseInt(line.split(':')[1] || '0', 10) || undefined;
			if (line.toLowerCase().includes(';filament used:')) {
				const m = line.match(/:\s*([\d.]+)/i);
				if (m) this.metadata.filamentUsed = parseFloat(m[1]);
			}
			if (line.toLowerCase().includes(';layer height:')) {
				const m = line.match(/:\s*([\d.]+)/i);
				if (m) this.metadata.layerHeight = parseFloat(m[1]);
			}

			if (line.toLowerCase().includes('; estimated printing time')) {
				const match = line.match(/(\d+h)?\s*(\d+m)?\s*(\d+s)?/i);
				if (match) this.metadata.estimatedTime = this.parseTimeString(match[0]);
			}
		}
	}

	getLayerCount(): number {
		return this.lines.filter((l) => /;\s*LAYER[:\s]/i.test(l) || /;\s*layer\b/i.test(l)).length;
	}

	estimatePrintTime(): number {
		if (this.metadata.estimatedTime) return this.metadata.estimatedTime;

		let total = 0;
		let pos: Position = { x: 0, y: 0, z: 0, e: 0 };
		let feed = 1200; // mm/min default
		for (const l of this.lines) {
			if (/^(G0|G1)\b/.test(l)) {
				const next = this.parsePosition(l);
				const newFeed = this.parseFeedRate(l);
				if (newFeed) feed = newFeed;
				const dist = this.distance(pos, next);
				total += (dist / feed) * 60; // seconds
				pos = { ...pos, ...next } as Position;
			}
		}
		return Math.round(total);
	}

	private parsePosition(line: string): Partial<Position> {
		const val = (axis: string) => {
			const m = line.match(new RegExp(axis + '([\-\d.]+)'));
			return m ? parseFloat(m[1]) : undefined;
		};
		return { x: val('X'), y: val('Y'), z: val('Z'), e: val('E') };
	}

	private parseFeedRate(line: string): number | null {
		const m = line.match(/F([\d.]+)/);
		return m ? parseFloat(m[1]) : null;
	}

	private distance(a: Position, b: Partial<Position>): number {
		const dx = (b.x ?? a.x) - a.x;
		const dy = (b.y ?? a.y) - a.y;
		const dz = (b.z ?? a.z) - a.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	}

	private parseTimeString(s: string): number {
		let total = 0;
		const h = s.match(/(\d+)h/i);
		const m = s.match(/(\d+)m/i);
		const sec = s.match(/(\d+)s/i);
		if (h) total += parseInt(h[1]) * 3600;
		if (m) total += parseInt(m[1]) * 60;
		if (sec) total += parseInt(sec[1]);
		return total;
	}
}

export default GCodeParser;
