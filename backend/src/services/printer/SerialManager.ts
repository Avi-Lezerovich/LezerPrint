import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import EventEmitter from 'events';

type Command = {
	gcode: string;
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
	timestamp: number;
	timeout?: NodeJS.Timeout;
};

type ParsedResponse =
	| { type: 'ok' }
	| { type: 'error'; message: string }
	| { type: 'temperature'; data: any }
	| { type: 'position'; data: any }
	| { type: 'raw'; line: string };

export class SerialManager extends EventEmitter {
	private port: SerialPort | null = null;
	private parser: ReadlineParser | null = null;
	private commandQueue: Command[] = [];
	private _isConnected = false;
	private currentCommand: Command | null = null;
	private defaultTimeoutMs = 5000;

	get isConnected() {
		return this._isConnected;
	}

	async connect(portPath?: string, baudRate: number = parseInt(process.env.PRINTER_BAUDRATE || '115200')) {
		const path = portPath || process.env.PRINTER_PORT;
		if (!path) throw new Error('PRINTER_PORT not configured');

		this.port = new SerialPort({ path, baudRate, autoOpen: false });
		this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

		await this.openPort();
		this.setupEventHandlers();
		await this.initialize();
		this._isConnected = true;
		this.emit('connected');
	}

	private openPort(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.port?.open((err) => (err ? reject(err) : resolve()));
		});
	}

	private async initialize() {
		// Basic init: wait a bit and clear buffer
		await new Promise((r) => setTimeout(r, 500));
		// Try to get an ok
		try {
			await this.sendCommand('M115', true); // firmware info
		} catch {}
	}

	private setupEventHandlers() {
		this.parser?.on('data', (line: string) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			const response = this.parseResponse(trimmed);
			this.emit('response', response);

			if (response.type === 'temperature') this.emit('temperature', response.data);
			if (response.type === 'position') this.emit('position', response.data);

			if (response.type === 'ok' && this.currentCommand) {
				clearTimeout(this.currentCommand.timeout);
				this.currentCommand.resolve('ok');
				this.currentCommand = null;
				this.processQueue();
			}

			if (response.type === 'error') {
				if (this.currentCommand) {
					clearTimeout(this.currentCommand.timeout);
					this.currentCommand.reject(new Error(response.message));
					this.currentCommand = null;
				}
				this.emit('printer-error', response);
			}
		});

		this.port?.on('error', (error) => this.emit('error', error));
		this.port?.on('close', () => {
			this._isConnected = false;
			this.emit('disconnected');
		});
	}

	private parseResponse(line: string): ParsedResponse {
		if (line.toLowerCase().startsWith('ok')) return { type: 'ok' };
		if (line.toLowerCase().startsWith('error')) return { type: 'error', message: line };

		// M105 style temperature: T:xxx /xxx B:xxx /xxx ...
		if (/\bT:\s*[-\d.]+/.test(line) || /B:\s*[-\d.]+/.test(line)) {
			const num = (re: RegExp) => {
				const m = line.match(re);
				return m ? parseFloat(m[1]) : undefined;
			};
			const data = {
				hotendTemp: num(/T:\s*([\-\d.]+)/),
				hotendTarget: num(/T:\s*[\-\d.]+\s*\/\s*([\-\d.]+)/),
				bedTemp: num(/B:\s*([\-\d.]+)/),
				bedTarget: num(/B:\s*[\-\d.]+\s*\/\s*([\-\d.]+)/),
			};
			return { type: 'temperature', data };
		}

		// M114 position: X:.. Y:.. Z:.. E:..
		if (/X:\s*[-\d.]+/.test(line) && /Y:\s*[-\d.]+/.test(line)) {
			const num = (axis: string) => {
				const m = line.match(new RegExp(axis + ':\s*([\-\d.]+)'));
				return m ? parseFloat(m[1]) : undefined;
			};
			const data = { x: num('X'), y: num('Y'), z: num('Z'), e: num('E') };
			return { type: 'position', data };
		}

		return { type: 'raw', line };
	}

	async sendCommand(gcode: string, priority = false, timeoutMs = this.defaultTimeoutMs): Promise<any> {
		if (!this.port || !this.port.isOpen) throw new Error('Serial port not connected');

		return new Promise((resolve, reject) => {
			const command: Command = {
				gcode,
				resolve,
				reject,
				timestamp: Date.now(),
			};

			command.timeout = setTimeout(() => {
				if (this.currentCommand === command) this.currentCommand = null;
				reject(new Error(`Command timeout: ${gcode}`));
				this.processQueue();
			}, timeoutMs);

			if (priority) this.commandQueue.unshift(command);
			else this.commandQueue.push(command);

			this.processQueue();
		});
	}

	private processQueue() {
		if (!this._isConnected || this.currentCommand || this.commandQueue.length === 0) return;
		this.currentCommand = this.commandQueue.shift()!;
		this.port?.write(this.currentCommand.gcode + '\n');
	}

	async emergencyStop() {
		this.commandQueue = [];
		this.currentCommand = null;
		this.port?.write('M112\n');
	}

	async disconnect() {
		this._isConnected = false;
		this.commandQueue = [];
		if (this.port?.isOpen) {
			await new Promise<void>((resolve) => this.port?.close(() => resolve()));
		}
	}
}

export default SerialManager;
