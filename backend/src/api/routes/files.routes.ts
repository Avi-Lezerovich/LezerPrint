import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateToken } from '../../middleware/auth.middleware';
import { prisma } from '../../lib/prisma';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
	destination: async (_req, _file, cb) => {
		await fs.mkdir(uploadDir, { recursive: true });
		cb(null, uploadDir);
	},
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		cb(null, unique + path.extname(file.originalname).toLowerCase());
	},
});
const upload = multer({ storage });

// GET /api/files
router.get('/', authenticateToken, async (req: Request, res: Response) => {
	const { page = '1', limit = '20', type } = req.query;
	const where: any = {};
	if (type) where.fileType = String(type).toUpperCase();
	const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
	const take = parseInt(String(limit));
	const [items, total] = await Promise.all([
		prisma.file.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
		prisma.file.count({ where }),
	]);
	return res.json({ success: true, data: { files: items }, meta: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / take) } });
});

// GET /api/files/:id
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
	const file = await prisma.file.findUnique({ where: { id: req.params.id } });
	if (!file) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
	return res.json({ success: true, data: { file } });
});

// POST /api/files/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
	if (!req.file) return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded' } });
	const created = await prisma.file.create({
		data: {
			userId: (req.user as any).userId,
			originalName: req.file.originalname,
			filePath: req.file.path,
			fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
			fileSize: BigInt(req.file.size),
		} as any,
	});
	return res.status(201).json({ success: true, data: { file: created } });
});

// DELETE /api/files/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
	const file = await prisma.file.findUnique({ where: { id: req.params.id } });
	if (!file) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
	try { await fs.unlink(file.filePath).catch(() => {}); } catch {}
	await prisma.file.delete({ where: { id: req.params.id } });
	return res.json({ success: true });
});

export default router;
