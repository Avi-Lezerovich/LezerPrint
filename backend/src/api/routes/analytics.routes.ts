import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/dashboard', authenticateToken, async (_req: Request, res: Response) => {
	const total = await prisma.printJob.count();
	const completed = await prisma.printJob.count({ where: { status: 'COMPLETED' as any } });
	const failed = await prisma.printJob.count({ where: { status: 'FAILED' as any } });
	const successRate = total ? (completed / total) * 100 : 0;
	return res.json({ success: true, data: { totalPrints: total, successRate, totalTime: 0, materialUsed: 0, averagePrintTime: 0, trends: [] } });
});

router.get('/statistics', authenticateToken, async (_req: Request, res: Response) => {
	// Placeholder statistics
	return res.json({ success: true, data: { statistics: [] } });
});

router.get('/materials', authenticateToken, async (_req: Request, res: Response) => {
	return res.json({ success: true, data: { materials: [] } });
});

router.get('/failures', authenticateToken, async (_req: Request, res: Response) => {
	return res.json({ success: true, data: { failures: [] } });
});

export default router;
