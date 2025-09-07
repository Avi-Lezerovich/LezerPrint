import { Router, Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';
import { fileUploadService } from '../../services/files/FileUploadService';
import { prisma } from '../../lib/prisma';

const router = Router();

// GET /api/files
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', type, sort = 'date', order = 'desc' } = req.query;
    const userId = (req.user as any).userId;

    const files = await fileUploadService.getUserFiles(userId, {
      type: type as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: sort as 'name' | 'date' | 'size',
      order: order as 'asc' | 'desc',
    });

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve files',
      },
    });
  }
});

// GET /api/files/:id
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).userId;
    const file = await prisma.file.findFirst({
      where: {
        id: req.params.id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            printJobs: true,
          },
        },
      },
    });

    if (!file) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { file },
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve file',
      },
    });
  }
});

// POST /api/files/upload
router.post('/upload', authenticateToken, fileUploadService.getUploadMiddleware(), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
      return;
    }

    const userId = (req.user as any).userId;
    const folder = req.body.folder;

    const savedFile = await fileUploadService.processUploadedFile(req.file, userId, folder);

    res.status(201).json({
      success: true,
      data: { file: savedFile },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPLOAD_FAILED',
        message: error instanceof Error ? error.message : 'File upload failed',
      },
    });
  }
});

// DELETE /api/files/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).userId;
    const success = await fileUploadService.deleteFile(req.params.id, userId);

    if (!success) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found or access denied',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'File deleted successfully' },
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete file',
      },
    });
  }
});

// GET /api/files/:id/download
router.get('/:id/download', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any).userId;
    const fileStream = await fileUploadService.getFileStream(req.params.id, userId);

    if (!fileStream) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'File not found',
        },
      });
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileStream.filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    fileStream.stream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download file',
      },
    });
  }
});

export default router;
