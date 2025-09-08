# 👩‍💻 Development Guide

*Complete guide for developers working on LezerPrint*

---

## 📖 Table of Contents

- [Project Architecture](#-project-architecture)
- [Development Setup](#-development-setup)
- [Code Organization](#-code-organization)
- [Coding Standards](#-coding-standards)
- [Component Guidelines](#-component-guidelines)
- [State Management](#-state-management)
- [API Development](#-api-development)
- [Database Operations](#-database-operations)
- [Testing Strategy](#-testing-strategy)
- [Performance Optimization](#-performance-optimization)
- [Security Guidelines](#-security-guidelines)
- [Accessibility](#-accessibility)
- [Debugging Techniques](#-debugging-techniques)

---

## 🏗️ Project Architecture

### High-Level Overview

```
LezerPrint/
├── frontend/          # Next.js React application
├── backend/           # Node.js Express API server
├── docs/             # Documentation
├── docker-compose.*.yml  # Docker configurations
├── start.sh          # Development startup script
└── stop.sh           # Shutdown script
```

### Technology Stack

#### Frontend (Next.js 15)
```typescript
// Core Technologies
- Next.js 15         // React framework with App Router
- TypeScript         // Type safety
- Tailwind CSS       // Utility-first styling
- TanStack Query     // Server state management
- Zustand           // Client state management
- Socket.io Client   // Real-time communication
- Framer Motion     // Animations
- Recharts          // Data visualization
- Three.js          // 3D rendering
```

#### Backend (Node.js)
```typescript
// Core Technologies
- Node.js 20+        // Runtime environment
- Express.js         // Web framework
- TypeScript         // Type safety
- Socket.io          // Real-time WebSocket
- Prisma ORM         // Database toolkit
- PostgreSQL         // Primary database
- Redis              // Caching & sessions
- JWT                // Authentication
- Zod                // Runtime validation
```

### Architecture Patterns

#### Frontend Architecture
- **Component-Based Architecture**: Modular, reusable React components
- **Feature-First Organization**: Components grouped by functionality
- **Presentation/Container Pattern**: Separation of logic and UI
- **Hook-Based State**: Custom hooks for shared logic
- **Server State Separation**: TanStack Query for API data

#### Backend Architecture
- **Layered Architecture**: Routes → Controllers → Services → Database
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Cross-cutting concerns
- **Service Layer**: Business logic encapsulation
- **Event-Driven**: WebSocket for real-time updates

---

## 🚀 Development Setup

### Prerequisites

```bash
# Required software
Node.js 20+
Docker Desktop
Git
VS Code (recommended)

# VS Code Extensions (recommended)
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- Prisma
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- GitLens
```

### Quick Start

```bash
# 1. Clone and setup
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint
npm run setup

# 2. Start development environment
./start.sh

# 3. Open VS Code
code .
```

### Development Workflow

```bash
# Start development servers
npm run dev

# This starts:
# - Frontend: http://localhost:3000 (hot reload)
# - Backend: http://localhost:3001 (auto-restart)
# - Database: PostgreSQL + Redis
# - Prisma Studio: http://localhost:5555
```

### Environment Setup

Create development environment files:

**backend/.env**
```env
DATABASE_URL="postgresql://developer:devpass123@localhost:5432/lezerprint_dev"
JWT_SECRET="dev-secret-key"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 📁 Code Organization

### Frontend Structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   ├── (dashboard)/       # Dashboard layout group
│   ├── api/               # API routes (Next.js)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── analytics/         # Analytics components
│   ├── camera/           # Camera components
│   ├── printer/          # Printer controls
│   ├── settings/         # Settings components
│   └── ui/               # Base UI components
├── lib/                  # Utilities and configurations
├── services/             # API service layer
├── stores/               # Zustand stores
└── styles/              # Global styles
```

### Backend Structure

```
backend/src/
├── api/                  # API route handlers
│   └── routes/          # Organized by feature
├── controllers/         # Request handlers
├── middleware/          # Express middleware
├── services/            # Business logic layer
│   ├── printer/         # Printer communication
│   ├── files/           # File management
│   └── analytics/       # Data analysis
├── lib/                 # Utilities and database
├── websocket/           # Socket.io handlers
└── server.ts           # Application entry point
```

### Component Organization

#### Feature-First Approach

```typescript
// Group components by feature, not by type
components/
├── analytics/
│   ├── AnalyticsDashboard.tsx
│   ├── MetricsCard.tsx
│   └── ChartContainer.tsx
├── printer/
│   ├── PrinterStatus.tsx
│   ├── ControlPanel.tsx
│   └── GCodeTerminal.tsx
└── ui/                  # Shared UI components
    ├── Button.tsx
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

---

## 📝 Coding Standards

### TypeScript Guidelines

#### Strict Type Safety

```typescript
// Always use explicit types for function parameters and returns
function calculatePrintTime(
  layers: number,
  layerHeight: number,
  printSpeed: number
): number {
  return layers * layerHeight / printSpeed;
}

// Use interfaces for object shapes
interface PrinterStatus {
  state: 'idle' | 'printing' | 'paused' | 'error';
  temperatures: TemperatureData;
  position: Position3D;
  progress?: PrintProgress;
}

// Prefer type unions over enums when possible
type JobStatus = 'QUEUED' | 'PRINTING' | 'COMPLETED' | 'FAILED';
```

#### Error Handling

```typescript
// Use Result/Either pattern for error handling
type ApiResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

// Always handle async operations properly
async function uploadFile(file: File): Promise<ApiResult<FileData>> {
  try {
    const response = await api.post('/files/upload', formData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: handleApiError(error) 
    };
  }
}
```

### React Guidelines

#### Component Structure

```typescript
// Component file structure pattern
import React from 'react';
import { useState, useEffect } from 'react';
import { someUtility } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

// Types first
interface PrinterControlProps {
  printerId: string;
  onStatusChange: (status: PrinterStatus) => void;
}

// Component implementation
export function PrinterControl({ printerId, onStatusChange }: PrinterControlProps) {
  // State declarations
  const [status, setStatus] = useState<PrinterStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Effects
  useEffect(() => {
    // Side effect logic
  }, [printerId]);

  // Event handlers
  const handleStart = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="printer-control">
      {/* JSX content */}
    </div>
  );
}
```

#### Hooks Best Practices

```typescript
// Custom hooks for shared logic
function usePrinterStatus(printerId: string) {
  const [status, setStatus] = useState<PrinterStatus>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const subscription = printerService.subscribe(printerId, setStatus);
    return () => subscription.unsubscribe();
  }, [printerId]);

  return { status, isLoading, error };
}

// Use custom hooks in components
function PrinterDashboard({ printerId }: { printerId: string }) {
  const { status, isLoading, error } = usePrinterStatus(printerId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <PrinterStatus status={status} />;
}
```

### CSS/Styling Guidelines

#### Tailwind CSS Best Practices

```typescript
// Use consistent spacing scale
const spacing = {
  xs: 'p-2',     // 8px
  sm: 'p-4',     // 16px
  md: 'p-6',     // 24px
  lg: 'p-8',     // 32px
  xl: 'p-12',    // 48px
};

// Organize classes logically
<div className={cn(
  // Layout
  'flex flex-col',
  // Spacing
  'p-6 gap-4',
  // Visual
  'bg-white rounded-lg shadow-md',
  // Responsive
  'md:flex-row md:p-8',
  // Conditional
  isActive && 'ring-2 ring-blue-500'
)}>
```

#### Component Variants

```typescript
// Use cva (class-variance-authority) for component variants
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

---

## 🎯 Component Guidelines

### Component Types

#### 1. UI Components (Presentational)

```typescript
// Pure, reusable UI components
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      {...props}
    />
  );
}
```

#### 2. Feature Components (Container)

```typescript
// Components that handle business logic
export function PrintJobManager() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['printJobs'],
    queryFn: () => api.getPrintJobs(),
  });

  const startJob = useMutation({
    mutationFn: (jobId: string) => api.startPrintJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(['printJobs']);
      toast.success('Print job started');
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      {jobs?.map(job => (
        <PrintJobCard 
          key={job.id} 
          job={job} 
          onStart={() => startJob.mutate(job.id)}
        />
      ))}
    </div>
  );
}
```

#### 3. Layout Components

```typescript
// Components that structure pages
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Component Patterns

#### Compound Components

```typescript
// For complex components with multiple parts
const Card = {
  Root: ({ children, className, ...props }: CardProps) => (
    <div className={cn('rounded-lg border bg-white', className)} {...props}>
      {children}
    </div>
  ),
  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 pb-0">
      {children}
    </div>
  ),
  Content: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6">
      {children}
    </div>
  ),
  Footer: ({ children }: { children: React.ReactNode }) => (
    <div className="p-6 pt-0">
      {children}
    </div>
  ),
};

// Usage
<Card.Root>
  <Card.Header>
    <h2>Print Statistics</h2>
  </Card.Header>
  <Card.Content>
    <StatisticsChart />
  </Card.Content>
</Card.Root>
```

---

## 🗄️ State Management

### Client State (Zustand)

```typescript
// Use Zustand for client-side state
interface PrinterStore {
  selectedPrinter: string | null;
  isConnected: boolean;
  currentJob: PrintJob | null;
  
  // Actions
  selectPrinter: (id: string) => void;
  setConnection: (connected: boolean) => void;
  updateJob: (job: PrintJob) => void;
}

export const usePrinterStore = create<PrinterStore>((set) => ({
  selectedPrinter: null,
  isConnected: false,
  currentJob: null,

  selectPrinter: (id) => set({ selectedPrinter: id }),
  setConnection: (connected) => set({ isConnected: connected }),
  updateJob: (job) => set({ currentJob: job }),
}));
```

### Server State (TanStack Query)

```typescript
// Use TanStack Query for server state
export function useFiles(filters?: FileFilters) {
  return useQuery({
    queryKey: ['files', filters],
    queryFn: () => api.getFiles(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => api.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries(['files']);
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}
```

### Real-Time State (WebSocket)

```typescript
// WebSocket integration with TanStack Query
export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);

    // Initial connection status
    socket.on('status', (status) => {
      queryClient.setQueryData(['connection', 'status'], status);
    });

    // Print lifecycle events
    socket.on('print:started', (job) => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.setQueryData(['jobs', job.id], job);
    });

    socket.on('print:progress', ({ jobId, progress }) => {
      queryClient.setQueryData(['jobs', jobId], (old: any) => ({
        ...(old || {}),
        progress,
      }));
    });

    socket.on('print:completed', ({ jobId, job }) => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.setQueryData(['jobs', jobId], job);
    });

    return () => socket.disconnect();
  }, [queryClient]);
}
```

---

## 🔌 API Development

### Backend Route Structure

```typescript
// Routes follow RESTful conventions
const router = Router();

// GET /api/printer/status
router.get('/status', authenticateToken, getPrinterStatus);

// POST /api/printer/command
router.post('/command', authenticateToken, requireOperator, sendCommand);

export default router;
```

### Controller Pattern

```typescript
// Controllers handle HTTP requests/responses
export async function getPrintJobs(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = (req.user as AuthUser).userId;

    const result = await printJobService.getUserJobs(userId, {
      page: Number(page),
      limit: Number(limit),
      status: status as JobStatus,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}
```

### Service Layer

```typescript
// Services contain business logic
export class PrintJobService {
  async createJob(userId: string, data: CreateJobData): Promise<PrintJob> {
    // Validate input
    const validation = createJobSchema.parse(data);
    
    // Check file ownership
    const file = await prisma.file.findFirst({
      where: { id: data.fileId, userId },
    });
    
    if (!file) {
      throw new Error('File not found or access denied');
    }

    // Create job
    const job = await prisma.printJob.create({
      data: {
        userId,
        fileId: data.fileId,
        status: 'QUEUED',
        estimatedTime: this.calculateEstimatedTime(file),
      },
      include: {
        file: true,
        user: { select: { username: true } },
      },
    });

    // Emit WebSocket event
  this.io.emit('print:started', { job });

    return job;
  }

  private calculateEstimatedTime(file: File): number {
    // Business logic for time estimation
    return file.metadata?.estimatedTime || 3600;
  }
}
```

---

## 🗃️ Database Operations

### Prisma Best Practices

#### Efficient Queries

```typescript
// Include only what you need
const files = await prisma.file.findMany({
  where: { userId },
  select: {
    id: true,
    originalName: true,
    fileSize: true,
    createdAt: true,
    _count: {
      select: { printJobs: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: (page - 1) * 20,
});

// Use transactions for related operations
await prisma.$transaction([
  prisma.printJob.update({
    where: { id: jobId },
    data: { status: 'COMPLETED' }
  }),
  prisma.user.update({
    where: { id: userId },
    data: { totalPrints: { increment: 1 } }
  }),
]);
```

#### Schema Migrations

```typescript
// Use Prisma migrations for schema changes
// 1. Update schema.prisma
// 2. Generate migration
npx prisma migrate dev --name add_timelapse_support

// 3. Apply to production
npx prisma migrate deploy
```

### Data Validation

```typescript
// Use Zod for runtime validation
const createJobSchema = z.object({
  fileId: z.string().uuid(),
  profileId: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  settings: z.object({
    temperature: z.number().min(0).max(300),
    speed: z.number().min(10).max(200),
  }).optional(),
});

// Validate in controllers
export async function createPrintJob(req: Request, res: Response) {
  try {
    const data = createJobSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: error.issues,
        },
      });
    }
  }
}
```

---

## 🧪 Testing Strategy

### Unit Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { PrinterControl } from './PrinterControl';

describe('PrinterControl', () => {
  it('should start print job when start button is clicked', async () => {
    const mockOnStart = jest.fn();
    
    render(
      <PrinterControl 
        status="idle" 
        onStart={mockOnStart} 
      />
    );
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing

```typescript
// Backend testing with Jest and Supertest
import request from 'supertest';
import app from '../src/server';

describe('Print Jobs API', () => {
  let authToken: string;

  beforeEach(async () => {
    // Setup test data and auth
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    
    authToken = response.body.data.token;
  });

  it('should create a new print job', async () => {
    const response = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fileId: 'test-file-id',
        priority: 'normal',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.job).toHaveProperty('id');
  });
});
```

### E2E Testing

```typescript
// End-to-end testing with Playwright
import { test, expect } from '@playwright/test';

test('complete print workflow', async ({ page }) => {
  // Login
  await page.goto('/auth/login');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  // Upload file
  await page.goto('/dashboard/files');
  await page.setInputFiles('[data-testid=file-upload]', 'test-model.stl');
  await expect(page.locator('[data-testid=upload-success]')).toBeVisible();

  // Start print job
  await page.click('[data-testid=start-print]');
  await expect(page.locator('[data-testid=job-started]')).toBeVisible();
});
```

---

## ⚡ Performance Optimization

### Frontend Optimization

#### Code Splitting

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalyticsDashboard />
    </Suspense>
  );
}
```

#### Memoization

```typescript
// Memoize expensive calculations
const ExpensiveChart = memo(({ data }: { data: ChartData[] }) => {
  const processedData = useMemo(
    () => data.map(item => ({ ...item, computed: heavyCalculation(item) })),
    [data]
  );

  return <Chart data={processedData} />;
});
```

#### Virtual Scrolling

```typescript
// For large lists
import { FixedSizeList } from 'react-window';

function FileList({ files }: { files: File[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <FileItem file={files[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={files.length}
      itemSize={80}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Backend Optimization

#### Database Optimization

```typescript
// Add proper indexes
model PrintJob {
  id        String   @id @default(uuid())
  userId    String
  status    JobStatus
  createdAt DateTime @default(now())
  
  @@index([userId, status])      // Composite index
  @@index([createdAt])           // Time-based queries
  @@index([status, createdAt])   // Status with time ordering
}
```

#### Caching Strategy

```typescript
// Redis caching
import { Redis } from 'ioredis';

class CacheService {
  private redis = new Redis(process.env.REDIS_URL);

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in services
export class PrintJobService {
  async getUserJobs(userId: string): Promise<PrintJob[]> {
    const cacheKey = `user:${userId}:jobs`;
    const cached = await cache.get<PrintJob[]>(cacheKey);
    
    if (cached) return cached;

    const jobs = await prisma.printJob.findMany({
      where: { userId },
      include: { file: true },
    });

    await cache.set(cacheKey, jobs, 300); // 5 minutes
    return jobs;
  }
}
```

---

## 🔒 Security Guidelines

### Input Validation

```typescript
// Always validate input data
const updateSettingsSchema = z.object({
  printerName: z.string().min(1).max(50),
  maxFileSize: z.number().min(1).max(100 * 1024 * 1024), // 100MB
  allowedFileTypes: z.array(z.enum(['STL', 'GCODE'])),
});

export async function updateSettings(req: Request, res: Response) {
  try {
    const validatedData = updateSettingsSchema.parse(req.body);
    // Process validated data
  } catch (error) {
    // Handle validation error
  }
}
```

### Authentication & Authorization

```typescript
// Middleware for role-based access
export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    
    if (!user || !hasRole(user.role, role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }
    
    next();
  };
}

// Role hierarchy
function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const hierarchy = { ADMIN: 3, OPERATOR: 2, VIEWER: 1 };
  return hierarchy[userRole] >= hierarchy[requiredRole];
}
```

### File Upload Security

```typescript
// Secure file upload handling
const upload = multer({
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueName}${ext}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB default
    files: 1,
  },
  fileFilter: (req, file, cb) => {
  const allowedTypes = ['stl', 'gcode'];
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  },
});
```

---

## ♿ Accessibility

Keep the UI inclusive and keyboard-friendly:

- Semantic HTML and labels: use native elements and associate labels/aria-labels appropriately
- Keyboard access: ensure focusable controls, visible focus rings, and logical tab order
- Color contrast: meet WCAG 2.1 AA; don’t rely on color alone to convey state
- Motion sensitivity: respect prefers-reduced-motion; avoid large auto animations when set
- Live updates: use aria-live regions for status messages like print progress
- Forms: provide inline error messages tied to inputs via aria-describedby

Tip: Add lightweight a11y checks to PRs (axe DevTools in browser, React Testing Library queries by role/name).

---

## 🐛 Debugging Techniques

### Frontend Debugging

#### React DevTools

```typescript
// Use displayName for better debugging
const PrinterControl = memo(function PrinterControl(props) {
  // Component logic
});

// Add debug information in development
if (process.env.NODE_ENV === 'development') {
  PrinterControl.displayName = 'PrinterControl';
}
```

#### Error Boundaries

```typescript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### Backend Debugging

#### Logging Strategy

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lezerprint-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage in services
export class PrinterService {
  async sendCommand(command: string): Promise<string> {
    logger.info('Sending command to printer', { command });
    
    try {
      const result = await this.printer.send(command);
      logger.info('Command executed successfully', { command, result });
      return result;
    } catch (error) {
      logger.error('Command failed', { command, error: error.message });
      throw error;
    }
  }
}
```

#### API Debugging

```typescript
// Request/Response logging middleware
export function logRequests(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
    });
  });
  
  next();
}
```

---

## 🔧 Development Tools

### Recommended VS Code Settings

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "typescript": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

### Useful Scripts

```json
{
  "scripts": {
    "dev": "./start.sh",
    "build": "npm run build:frontend && npm run build:backend",
    "build:frontend": "cd frontend && npm run build",
    "build:backend": "cd backend && npm run build",
    "test": "npm run test:frontend && npm run test:backend",
    "test:frontend": "cd frontend && npm run test",
    "test:backend": "cd backend && npm run test",
    "type-check": "npm run type-check:frontend && npm run type-check:backend",
    "lint": "npm run lint:frontend && npm run lint:backend",
    "db:reset": "cd backend && npx prisma migrate reset",
    "db:studio": "cd backend && npx prisma studio"
  }
}
```

---

## 📚 Additional Resources

### Learning Resources
- [**Next.js Documentation**](https://nextjs.org/docs)
- [**Prisma Documentation**](https://www.prisma.io/docs)
- [**TanStack Query Documentation**](https://tanstack.com/query)
- [**Tailwind CSS Documentation**](https://tailwindcss.com/docs)

### Code Quality
- [**ESLint Configuration**](.eslintrc.js)
- [**Prettier Configuration**](.prettierrc)
- [**TypeScript Configuration**](tsconfig.json)

### Deployment
- [**Deployment Guide**](DEPLOYMENT.md)
- [**Architecture Overview**](ARCHITECTURE.md)
- [**Security Guidelines**](SECURITY.md)

---

**Happy coding!** 🚀 Need help? Check our [**Troubleshooting Guide**](TROUBLESHOOTING.md) or [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues).