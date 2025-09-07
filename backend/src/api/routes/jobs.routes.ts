import { Router, Request, Response } from 'express';
import { authenticateToken, requireOperator } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';

const router = Router();

// GET /api/jobs
router.get('/', authenticateToken, async (req: Request, res: Response) => {
	const { status, page = '1', limit = '20' } = req.query;
	const where: any = {};
	if (status) where.status = String(status).toUpperCase();
	const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
	const take = parseInt(String(limit));
	const [items, total] = await Promise.all([
		prisma.printJob.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
		prisma.printJob.count({ where }),
	]);
	return res.json({ success: true, data: { jobs: items }, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / take) } });
});

// GET /api/jobs/:id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
	const job = await prisma.printJob.findUnique({ where: { id: req.params.id } });
	if (!job) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
	return res.json({ success: true, data: { job, events: [], temperatures: [] } });
});

// Placeholder start/pause/resume/cancel endpoints (DB only for now)
router.post('/start', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const { fileId } = req.body;
	if (!fileId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'fileId required' } });
	const job = await prisma.printJob.create({ data: { userId: (req.user as any).userId, fileId, status: 'PRINTING', progress: 0, startedAt: new Date() } as any });
	return res.status(201).json({ success: true, data: { job } });
});

router.post('/:id/pause', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const job = await prisma.printJob.update({ where: { id: req.params.id }, data: { status: 'PAUSED' } as any });
	return res.json({ success: true, data: { job } });
});

router.post('/:id/resume', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const job = await prisma.printJob.update({ where: { id: req.params.id }, data: { status: 'PRINTING' } as any });
	return res.json({ success: true, data: { job } });
});

router.post('/:id/cancel', authenticateToken, requireOperator, async (req: Request, res: Response) => {
	const job = await prisma.printJob.update({ where: { id: req.params.id }, data: { status: 'CANCELLED', completedAt: new Date() } as any });
	return res.json({ success: true, data: { job } });
});

export default router;
