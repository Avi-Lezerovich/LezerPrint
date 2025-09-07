import { Router, Request, Response } from 'express';
import { authenticateToken, requireOperator } from '../../middleware/auth.middleware';
import { printerService } from '../../services/printer/PrinterService';
import { z } from 'zod';

const router = Router();

router.get('/status', authenticateToken, async (_req: Request, res: Response) => {
	return res.json({ success: true, data: printerService.getStatus() });
});

router.post('/command', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const schema = z.object({
		command: z.string().min(1).max(120),
		wait: z.boolean().optional().default(true),
	});
	try {
		const { command, wait } = schema.parse(req.body);
		const response = await printerService.sendCommand(command, wait);
		return res.json({ success: true, data: { response } });
	} catch (e: any) {
		if (e?.issues) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: e.issues } });
		return res.status(500).json({ success: false, error: { code: 'PRINTER_ERROR', message: e?.message || 'Command failed' } });
	}
});

router.post('/home', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const schema = z.object({ axes: z.union([z.literal('all'), z.array(z.enum(['X', 'Y', 'Z']))]).default('all') });
	try {
		const { axes } = schema.parse(req.body);
		await printerService.home(axes as any);
		return res.json({ success: true });
	} catch (e: any) {
		if (e?.issues) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: e.issues } });
		return res.status(500).json({ success: false, error: { code: 'PRINTER_ERROR', message: e?.message || 'Home failed' } });
	}
});

router.post('/move', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const schema = z.object({ axis: z.enum(['X', 'Y', 'Z', 'E']), distance: z.number(), speed: z.number().min(1).max(10000) });
	try {
		const { axis, distance, speed } = schema.parse(req.body);
		await printerService.move(axis, distance, speed);
		return res.json({ success: true });
	} catch (e: any) {
		if (e?.issues) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: e.issues } });
		return res.status(500).json({ success: false, error: { code: 'PRINTER_ERROR', message: e?.message || 'Move failed' } });
	}
});

router.post('/temperature', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const schema = z.object({ hotend: z.number().min(0).max(300).optional(), bed: z.number().min(0).max(120).optional(), chamber: z.number().min(0).max(80).optional() });
	try {
		const body = schema.parse(req.body);
		await printerService.setTemperature(body);
		return res.json({ success: true });
	} catch (e: any) {
		if (e?.issues) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: e.issues } });
		return res.status(500).json({ success: false, error: { code: 'PRINTER_ERROR', message: e?.message || 'Set temperature failed' } });
	}
});

router.post('/emergency-stop', authenticateToken, requireOperator, async (_req: Request, res: Response) => {
	await printerService.emergencyStop();
	return res.json({ success: true });
});

router.post('/pause', authenticateToken, requireOperator, async (_req: Request, res: Response) => {
	await printerService.pause();
	return res.json({ success: true });
});

router.post('/resume', authenticateToken, requireOperator, async (_req: Request, res: Response) => {
	await printerService.resume();
	return res.json({ success: true });
});

router.post('/cancel', authenticateToken, requireOperator, async (_req: Request, res: Response) => {
	await printerService.cancel();
	return res.json({ success: true });
});

export default router;
