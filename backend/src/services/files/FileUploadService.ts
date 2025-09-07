import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma';

export interface FileMetadata {
  dimensions?: { width: number; height: number; depth: number };
  layerCount?: number;
  volume?: number;
  surfaceArea?: number;
  estimatedPrintTime?: number;
  filamentLength?: number;
}

export class FileUploadService {
  private upload!: multer.Multer;
  private uploadDir: string;
  private thumbnailDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    
    this.ensureDirectories();
    this.setupMulter();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'gcode'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'stl'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'temp'), { recursive: true });
    } catch (error) {
      console.error('Failed to create upload directories:', error);
    }
  }

  private setupMulter(): void {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const fileType = this.getFileTypeFromMime(file.mimetype);
        const subfolder = fileType === 'GCODE' ? 'gcode' : 'stl';
        cb(null, path.join(this.uploadDir, subfolder));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const safeName = this.sanitizeFilename(baseName);
        cb(null, `${safeName}-${uniqueSuffix}${ext}`);
      },
    });

    this.upload = multer({
      storage,
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '100000000'), // 100MB default
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/octet-stream', // STL files
          'model/stl',
          'text/plain', // G-code files
          'application/x-gcode',
        ];

        const allowedExtensions = ['.stl', '.gcode', '.gco', '.g'];
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.originalname}. Allowed: STL, G-code`));
        }
      },
    });
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100); // Limit length
  }

  private getFileTypeFromMime(mimetype: string): 'STL' | 'GCODE' | 'OBJ' | 'THREEMF' {
    if (mimetype.includes('stl') || mimetype === 'application/octet-stream') {
      return 'STL';
    }
    if (mimetype.includes('text') || mimetype.includes('gcode')) {
      return 'GCODE';
    }
    return 'STL'; // Default
  }

  private getFileTypeFromExtension(filename: string): 'STL' | 'GCODE' | 'OBJ' | 'THREEMF' {
    const ext = path.extname(filename).toLowerCase();
    
    switch (ext) {
      case '.stl':
        return 'STL';
      case '.gcode':
      case '.gco':
      case '.g':
        return 'GCODE';
      case '.obj':
        return 'OBJ';
      case '.3mf':
        return 'THREEMF';
      default:
        return 'STL';
    }
  }

  public getUploadMiddleware() {
    return this.upload.single('file');
  }

  public getMultiUploadMiddleware(maxFiles: number = 10) {
    return this.upload.array('files', maxFiles);
  }

  public async processUploadedFile(
    file: Express.Multer.File,
    userId: string,
    folder?: string
  ): Promise<any> {
    try {
      const fileType = this.getFileTypeFromExtension(file.originalname);
      const fileSize = BigInt(file.size);

      // Generate metadata
      const metadata = await this.generateMetadata(file.path, fileType);

      // Generate thumbnail for STL files
      let thumbnailUrl: string | null = null;
      if (fileType === 'STL') {
        thumbnailUrl = await this.generateThumbnail(file.path, file.filename);
      }

      // Save to database
      const savedFile = await prisma.file.create({
        data: {
          userId,
          originalName: file.originalname,
          fileName: file.filename, // This field is required
          filePath: file.path,
          fileType,
          fileSize,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return savedFile;
    } catch (error) {
      // Clean up file on error
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
      throw error;
    }
  }

  private async generateMetadata(filePath: string, fileType: string): Promise<FileMetadata> {
    const metadata: FileMetadata = {};

    try {
      if (fileType === 'STL') {
        metadata.dimensions = await this.analyzeSTLFile(filePath);
      } else if (fileType === 'GCODE') {
        const gcodeData = await this.analyzeGCodeFile(filePath);
        metadata.layerCount = gcodeData.layerCount;
        metadata.estimatedPrintTime = gcodeData.estimatedTime;
        metadata.filamentLength = gcodeData.filamentLength;
      }
    } catch (error) {
      console.error('Failed to generate metadata:', error);
    }

    return metadata;
  }

  private async analyzeSTLFile(filePath: string): Promise<{ width: number; height: number; depth: number }> {
    // This is a simplified implementation
    // In a real implementation, you'd parse the STL file to get actual dimensions
    const stats = await fs.stat(filePath);
    
    // Mock dimensions based on file size (replace with actual STL parsing)
    const size = Math.cbrt(stats.size / 1000); // Rough estimate
    
    return {
      width: size,
      height: size,
      depth: size,
    };
  }

  private async analyzeGCodeFile(filePath: string): Promise<{
    layerCount: number;
    estimatedTime: number;
    filamentLength: number;
  }> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      let layerCount = 0;
      let estimatedTime = 0;
      let filamentLength = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Count layer changes
        if (trimmed.includes('LAYER:') || trimmed.includes(';LAYER ')) {
          layerCount++;
        }

        // Extract time estimate from comments
        if (trimmed.includes('estimated printing time')) {
          const timeMatch = trimmed.match(/(\d+)h\s*(\d+)m/);
          if (timeMatch) {
            estimatedTime = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60;
          }
        }

        // Extract filament usage
        if (trimmed.includes('filament used')) {
          const filamentMatch = trimmed.match(/([\d.]+)m/);
          if (filamentMatch) {
            filamentLength = parseFloat(filamentMatch[1]) * 1000; // Convert to mm
          }
        }
      }

      return { layerCount, estimatedTime, filamentLength };
    } catch (error) {
      console.error('Failed to analyze G-code file:', error);
      return { layerCount: 0, estimatedTime: 0, filamentLength: 0 };
    }
  }

  private async generateThumbnail(filePath: string, filename: string): Promise<string> {
    try {
      // For now, return a placeholder thumbnail
      // In a real implementation, you'd generate a 3D preview image
      const thumbnailName = `${path.parse(filename).name}.jpg`;
      const thumbnailPath = path.join(this.thumbnailDir, thumbnailName);

      // Create a simple placeholder image
      await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 240, g: 240, b: 240 },
        },
      })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return `/uploads/thumbnails/${thumbnailName}`;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return '';
    }
  }

  public async deleteFile(fileId: string, userId: string): Promise<boolean> {
    try {
      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) {
        return false;
      }

      // Delete physical file
      try {
        await fs.unlink(file.filePath);
      } catch (error) {
        console.error('Failed to delete physical file:', error);
      }

      // Delete thumbnail if exists
      // Note: thumbnailUrl field not yet implemented in schema
      // if (file.thumbnailUrl) {
      //   try {
      //     const thumbnailPath = path.join(process.cwd(), 'public', file.thumbnailUrl);
      //     await fs.unlink(thumbnailPath);
      //   } catch (error) {
      //     console.error('Failed to delete thumbnail:', error);
      //   }
      // }

      // Delete from database
      await prisma.file.delete({
        where: { id: fileId },
      });

      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  public async getFileStream(fileId: string, userId: string): Promise<{ stream: NodeJS.ReadableStream; filename: string } | null> {
    try {
      const file = await prisma.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });

      if (!file) {
        return null;
      }

      const fs = await import('fs');
      const stream = fs.createReadStream(file.filePath);
      
      return {
        stream,
        filename: file.originalName,
      };
    } catch (error) {
      console.error('Failed to get file stream:', error);
      return null;
    }
  }

  public async getUserFiles(
    userId: string,
    options: {
      type?: string;
      page?: number;
      limit?: number;
      sort?: 'name' | 'date' | 'size';
      order?: 'asc' | 'desc';
    } = {}
  ) {
    const {
      type,
      page = 1,
      limit = 20,
      sort = 'date',
      order = 'desc',
    } = options;

    const where: any = { userId };
    if (type) {
      where.fileType = type;
    }

    const orderBy: any = {};
    if (sort === 'name') {
      orderBy.originalName = order;
    } else if (sort === 'size') {
      orderBy.fileSize = order;
    } else {
      orderBy.createdAt = order;
    }

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.file.count({ where }),
    ]);

    return {
      files,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}

export const fileUploadService = new FileUploadService();
