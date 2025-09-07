import SerialManager from './SerialManager';

export type TemperatureData = {
	hotendTemp?: number;
	hotendTarget?: number;
	bedTemp?: number;
	bedTarget?: number;
};

export type Position = { x?: number; y?: number; z?: number; e?: number };

export type PrinterState = 'idle' | 'printing' | 'paused' | 'error';

export class PrinterService {
	private serial = new SerialManager();
	private temperatures: TemperatureData = {};
	private position: Position = {};
	private state: PrinterState = 'idle';
	private errorMsg?: string;

	constructor() {
		this.serial.on('temperature', (t: TemperatureData) => (this.temperatures = t));
		this.serial.on('position', (p: Position) => (this.position = p));
		this.serial.on('printer-error', (e: any) => {
			this.state = 'error';
			this.errorMsg = typeof e?.message === 'string' ? e.message : 'Printer error';
		});

		// Best effort connect on boot in background
		const autoConnect = async () => {
			try {
				if (!this.serial.isConnected) await this.serial.connect();
			} catch {}
		};
		autoConnect();

		// Poll temps/pos
		setInterval(async () => {
			try {
				if (this.serial.isConnected) {
					await this.serial.sendCommand('M105');
					if (this.state === 'printing') await this.serial.sendCommand('M114');
				}
			} catch {}
		}, 2000);
	}

	getStatus() {
		return {
			state: this.state,
			error: this.errorMsg,
			temperatures: this.temperatures,
			position: this.position,
			currentJob: null,
			connected: this.serial.isConnected,
		};
	}

	async ensureConnected() {
		if (!this.serial.isConnected) await this.serial.connect();
	}

	async sendCommand(command: string, wait = true) {
		await this.ensureConnected();
		return this.serial.sendCommand(command, false, wait ? 5000 : 0);
	}

	async home(axes: Array<'X' | 'Y' | 'Z'> | 'all' = 'all') {
		await this.ensureConnected();
		const cmd = axes === 'all' ? 'G28' : `G28 ${axes.join(' ')}`;
		return this.serial.sendCommand(cmd);
	}

	async move(axis: 'X' | 'Y' | 'Z' | 'E', distance: number, speed: number) {
		await this.ensureConnected();
		return this.serial.sendCommand(`G91`)
			.then(() => this.serial.sendCommand(`G1 ${axis}${distance} F${speed}`))
			.then(() => this.serial.sendCommand(`G90`));
	}

	async setTemperature({ hotend, bed, chamber }: { hotend?: number; bed?: number; chamber?: number }) {
		await this.ensureConnected();
		if (hotend !== undefined) await this.serial.sendCommand(`M104 S${hotend}`);
		if (bed !== undefined) await this.serial.sendCommand(`M140 S${bed}`);
		// Chamber commonly M141 but not standard; ignore if unset
		if (chamber !== undefined) await this.serial.sendCommand(`M141 S${chamber}`).catch(() => {});
	}

	async pause() {
		if (this.state !== 'printing') return;
		this.state = 'paused';
		await this.serial.sendCommand('M25').catch(() => {}); // SD pause if supported
		await this.serial.sendCommand('M0').catch(() => {});
	}

	async resume() {
		if (this.state !== 'paused') return;
		this.state = 'printing';
		await this.serial.sendCommand('M24').catch(() => {});
	}

	async cancel() {
		this.state = 'idle';
		await this.serial.sendCommand('M104 S0').catch(() => {});
		await this.serial.sendCommand('M140 S0').catch(() => {});
	}

	async emergencyStop() {
		await this.serial.emergencyStop();
		this.state = 'error';
	}
}

export const printerService = new PrinterService();
export default PrinterService;
