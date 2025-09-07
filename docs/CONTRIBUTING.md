# 🤝 Contributing to LezerPrint

*Welcome to the LezerPrint community! We're excited to have you contribute to the future of 3D printer management.*

---

## 📖 Table of Contents

- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Contribution Guidelines](#-contribution-guidelines)
- [Code Standards](#-code-standards)
- [Testing Requirements](#-testing-requirements)
- [Pull Request Process](#-pull-request-process)
- [Issue Guidelines](#-issue-guidelines)
- [Community Guidelines](#-community-guidelines)
- [Recognition](#-recognition)

---

## 🚀 Getting Started

### Ways to Contribute

We welcome all types of contributions:

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides, tutorials, and API docs
- 🧪 **Testing** - Add tests or test new features
- 🔧 **Code** - Fix bugs, implement features, or optimize performance
- 🎨 **Design** - UI/UX improvements and visual enhancements
- 🌍 **Translation** - Help make LezerPrint accessible worldwide
- 💬 **Community Support** - Help other users in discussions

### Contribution Process Overview

1. **Find or create an issue** to work on
2. **Fork the repository** and create a feature branch
3. **Set up your development environment**
4. **Make your changes** following our guidelines
5. **Write tests** for your changes
6. **Submit a pull request** for review
7. **Respond to feedback** and iterate
8. **Celebrate** when your contribution is merged! 🎉

---

## 💻 Development Setup

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download here](https://git-scm.com/)
- **Visual Studio Code** (recommended) - [Download here](https://code.visualstudio.com/)

### Quick Setup

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/LezerPrint.git
cd LezerPrint

# 3. Add upstream remote
git remote add upstream https://github.com/Avi-Lezerovich/LezerPrint.git

# 4. Install dependencies
npm run setup

# 5. Start development environment
./start.sh

# 6. Create a feature branch
git checkout -b feature/your-feature-name
```

### VS Code Setup

Install recommended extensions:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-jest"
  ]
}
```

Configure workspace settings:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Environment Configuration

Create environment files:

**backend/.env**
```env
DATABASE_URL="postgresql://developer:devpass123@localhost:5432/lezerprint_dev"
JWT_SECRET="dev-secret-key"
NODE_ENV="development"
```

**frontend/.env.local**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 📋 Contribution Guidelines

### Before You Start

1. **Check existing issues** - Look for similar problems or features
2. **Join the discussion** - Comment on issues you're interested in
3. **Start small** - Begin with good first issues or documentation
4. **Ask questions** - We're here to help in discussions or issues

### Issue Selection

#### Good First Issues 🟢
Perfect for newcomers:
- Documentation improvements
- UI text corrections
- Simple bug fixes
- Adding tests for existing features

#### Medium Complexity 🟡
For developers with some experience:
- New UI components
- API endpoint additions
- Performance optimizations
- Database schema changes

#### Advanced 🔴
For experienced contributors:
- Architecture changes
- Security enhancements
- Complex feature implementations
- Performance critical optimizations

### Issue Labels

| Label | Description | For Contributors |
|-------|-------------|------------------|
| `good first issue` | Easy pickups for newcomers | 🟢 Beginners |
| `help wanted` | Community help needed | 🟡 Experienced |
| `bug` | Something isn't working | 🟡 All levels |
| `enhancement` | New feature or request | 🟡 All levels |
| `documentation` | Improvements to docs | 🟢 All levels |
| `performance` | Speed or efficiency improvements | 🔴 Advanced |
| `security` | Security-related issues | 🔴 Advanced |
| `breaking change` | Requires major version bump | 🔴 Advanced |

---

## 📏 Code Standards

### Coding Conventions

#### TypeScript Style

```typescript
// ✅ Good - Use descriptive names
interface PrintJobConfiguration {
  temperature: number;
  printSpeed: number;
  layerHeight: number;
}

// ❌ Bad - Unclear abbreviations
interface PJConfig {
  temp: number;
  speed: number;
  height: number;
}

// ✅ Good - Use proper types
function calculatePrintTime(
  layers: number,
  layerHeight: number,
  printSpeed: number
): number {
  return layers * layerHeight / printSpeed;
}

// ❌ Bad - Missing types
function calculatePrintTime(layers, layerHeight, printSpeed) {
  return layers * layerHeight / printSpeed;
}
```

#### React Component Guidelines

```typescript
// ✅ Good - Functional component with proper typing
interface PrintStatusProps {
  printerId: string;
  onStatusChange: (status: PrinterStatus) => void;
}

export function PrintStatus({ printerId, onStatusChange }: PrintStatusProps) {
  const [status, setStatus] = useState<PrinterStatus>('idle');
  
  useEffect(() => {
    const subscription = printerService.subscribe(printerId, (newStatus) => {
      setStatus(newStatus);
      onStatusChange(newStatus);
    });
    
    return () => subscription.unsubscribe();
  }, [printerId, onStatusChange]);

  return (
    <div className="flex items-center space-x-2">
      <StatusIndicator status={status} />
      <span className="text-sm font-medium">{status}</span>
    </div>
  );
}
```

#### API Endpoint Patterns

```typescript
// ✅ Good - RESTful design with proper error handling
export async function createPrintJob(req: Request, res: Response) {
  try {
    // Validate input
    const validation = createJobSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: validation.error.issues
        }
      });
    }

    // Check permissions
    const user = req.user as AuthUser;
    if (!hasPermission(user, 'job:create')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions'
        }
      });
    }

    // Create job
    const job = await printJobService.createJob(user.id, validation.data);

    return res.status(201).json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create print job'
      }
    });
  }
}
```

### Database Guidelines

#### Schema Design

```typescript
// ✅ Good - Descriptive field names and proper constraints
model PrintJob {
  id            String    @id @default(uuid())
  userId        String    // Clear foreign key naming
  fileId        String
  status        JobStatus @default(QUEUED)
  progress      Float     @default(0) @db.Float
  startedAt     DateTime?
  completedAt   DateTime?
  estimatedTime Int?      // seconds, clearly documented
  actualTime    Int?      // seconds
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations with descriptive names
  user User @relation(fields: [userId], references: [id])
  file File @relation(fields: [fileId], references: [id])

  // Indexes for performance
  @@index([userId, status])
  @@index([createdAt])
  @@map("print_jobs")
}
```

### Documentation Standards

#### Code Comments

```typescript
/**
 * Calculates the estimated print time based on layer parameters
 * 
 * @param layers - Total number of layers in the print
 * @param layerHeight - Height of each layer in mm
 * @param printSpeed - Print speed in mm/min
 * @returns Estimated print time in seconds
 * 
 * @example
 * ```typescript
 * const time = calculatePrintTime(200, 0.2, 1000);
 * console.log(`Estimated time: ${time} seconds`);
 * ```
 */
function calculatePrintTime(
  layers: number,
  layerHeight: number,
  printSpeed: number
): number {
  // Calculate total print height
  const totalHeight = layers * layerHeight;
  
  // Estimate time based on height and speed
  // Note: This is a simplified calculation
  return Math.round(totalHeight / printSpeed * 60);
}
```

#### README Updates

When adding new features, update relevant documentation:

```markdown
## 🆕 New Feature: Advanced Analytics

### Overview
Advanced analytics provide deeper insights into print performance...

### Usage
```typescript
import { AnalyticsService } from '@/services/analytics';

const analytics = new AnalyticsService();
const metrics = await analytics.getPerformanceMetrics(userId);
```

### API Reference
- `GET /api/analytics/performance` - Get performance metrics
- `POST /api/analytics/export` - Export analytics data
```

---

## 🧪 Testing Requirements

### Test Coverage Requirements

- **Minimum coverage**: 80% for new code
- **Unit tests**: Required for all utility functions
- **Integration tests**: Required for API endpoints
- **Component tests**: Required for React components
- **E2E tests**: Required for critical user flows

### Testing Stack

```typescript
// Unit Tests - Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { PrintStatus } from './PrintStatus';

describe('PrintStatus', () => {
  it('should display printer status', () => {
    render(<PrintStatus printerId="test" onStatusChange={jest.fn()} />);
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('should call onStatusChange when status updates', async () => {
    const mockOnStatusChange = jest.fn();
    render(<PrintStatus printerId="test" onStatusChange={mockOnStatusChange} />);
    
    // Simulate status change
    fireEvent.click(screen.getByText('Start Print'));
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('printing');
  });
});
```

```typescript
// API Tests - Supertest
import request from 'supertest';
import app from '../src/server';

describe('Print Jobs API', () => {
  let authToken: string;

  beforeEach(async () => {
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
        priority: 'normal'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.job).toHaveProperty('id');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- PrintStatus.test.tsx

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Test Guidelines

1. **Descriptive test names** - Tests should read like specifications
2. **Test one thing** - Each test should focus on a single behavior
3. **Use data builders** - Create reusable test data factories
4. **Mock external dependencies** - Don't rely on external services
5. **Test error cases** - Include negative test scenarios

---

## 🔄 Pull Request Process

### PR Requirements Checklist

Before submitting a PR, ensure:

- [ ] **Code follows style guidelines** (ESLint passes)
- [ ] **Tests are written and passing** (minimum 80% coverage)
- [ ] **Documentation is updated** (if applicable)
- [ ] **PR description is complete** (see template below)
- [ ] **Commits are well-formatted** (conventional commits)
- [ ] **No merge conflicts** with main branch
- [ ] **CI checks pass** (build, test, lint)

### PR Template

Use this template for your pull request description:

```markdown
## 📝 Description
Brief description of the changes and their purpose.

## 🔗 Related Issue
Fixes #123

## 🧪 Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## ✅ Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## 📸 Screenshots (if applicable)
Add screenshots to show UI changes.

## 📋 Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass
```

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: type(scope): description

# Examples:
feat(api): add print job cancellation endpoint
fix(ui): resolve file upload progress indicator bug
docs(readme): update installation instructions
test(jobs): add integration tests for job creation
refactor(auth): simplify token validation logic
perf(db): optimize print job queries with indexing

# Breaking changes:
feat(api)!: restructure print job response format
```

### Review Process

1. **Automated checks** run on PR submission
2. **Maintainer review** within 48 hours (weekdays)
3. **Community review** encouraged for all PRs
4. **Changes requested** if needed with clear feedback
5. **Approval and merge** once all requirements met

### Review Criteria

#### Code Quality
- [ ] Code is readable and well-structured
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Performance considerations addressed

#### Functionality
- [ ] Feature works as expected
- [ ] Edge cases handled
- [ ] No regression introduced
- [ ] Security implications considered

#### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] All tests pass
- [ ] Manual testing documented

---

## 🐛 Issue Guidelines

### Bug Reports

Use this template for bug reports:

```markdown
## 🐛 Bug Description
A clear description of what the bug is.

## 🔄 Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior
What you expected to happen.

## ❌ Actual Behavior
What actually happened.

## 📸 Screenshots
If applicable, add screenshots.

## 🖥️ Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96.0]
- Node.js version: [e.g. 18.0.0]
- LezerPrint version: [e.g. 1.2.0]

## 📋 Additional Context
Any other context about the problem.
```

### Feature Requests

Use this template for feature requests:

```markdown
## 💡 Feature Request

### 📝 Description
A clear description of what you want to happen.

### 🎯 Problem Statement
What problem does this feature solve?

### 💭 Proposed Solution
How do you envision this feature working?

### 🔄 Alternatives Considered
Any alternative solutions or features you've considered.

### 📋 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### 🖼️ Mockups/Examples
Visual examples if applicable.

### 📊 Impact Assessment
- **Users affected**: [All users / Power users / Admin only]
- **Complexity**: [Low / Medium / High]
- **Priority**: [Low / Medium / High / Critical]
```

### Issue Triage Process

1. **Community triage** - Community members help label and prioritize
2. **Maintainer review** - Core team reviews within 1 week
3. **Priority assignment** - Based on impact and effort
4. **Milestone assignment** - Added to upcoming release if approved

---

## 🌟 Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment:

#### Our Pledge
- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome people of all backgrounds and identities
- **Be constructive** - Focus on what's best for the community
- **Be patient** - Help newcomers learn and grow

#### Expected Behavior
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

#### Unacceptable Behavior
- Harassment or discriminatory language
- Personal attacks or trolling
- Public or private harassment
- Publishing others' private information
- Conduct that could reasonably be considered inappropriate

### Communication Channels

#### GitHub Discussions
- **General discussions** - Ideas, questions, and general topics
- **Show and tell** - Share your projects using LezerPrint
- **Q&A** - Get help from the community

#### GitHub Issues
- **Bug reports** - Report problems
- **Feature requests** - Suggest improvements
- **Security issues** - Report security vulnerabilities (privately)

#### Pull Requests
- **Code contributions** - Submit changes for review
- **Documentation** - Improve guides and references

### Getting Help

#### For Users
1. Check the [**User Manual**](USER_MANUAL.md)
2. Search [**existing issues**](https://github.com/Avi-Lezerovich/LezerPrint/issues)
3. Ask in [**GitHub Discussions**](https://github.com/Avi-Lezerovich/LezerPrint/discussions)

#### For Developers
1. Read the [**Development Guide**](DEVELOPMENT_GUIDE.md)
2. Check the [**API Reference**](API_REFERENCE.md)
3. Look at existing code examples
4. Ask questions in discussions or issues

---

## 🏆 Recognition

### Contributors

We recognize all types of contributions in our repository:

#### Commit Access
Long-term contributors may be invited to join the core team with commit access.

#### Special Recognition
- **Monthly contributor spotlight** in discussions
- **Contributor list** in README
- **Special badges** for significant contributions

#### Types of Contributions We Celebrate

- 🐛 **Bug fixes** - Helping improve stability
- ✨ **New features** - Adding valuable functionality
- 📚 **Documentation** - Making LezerPrint more accessible
- 🧪 **Testing** - Ensuring quality and reliability
- 🎨 **Design** - Improving user experience
- 🌍 **Community** - Helping other users
- 🔧 **Infrastructure** - Improving development experience

### Hall of Fame

#### Top Contributors
*Will be updated as contributors join the project*

#### Special Thanks
- **Beta testers** - Early adopters who help identify issues
- **Documentation writers** - Making complex topics accessible
- **Community moderators** - Keeping discussions helpful and welcoming

---

## 📚 Additional Resources

### Learning Resources
- [**React Documentation**](https://react.dev/) - Frontend framework
- [**Next.js Documentation**](https://nextjs.org/docs) - React framework
- [**Node.js Documentation**](https://nodejs.org/docs/) - Backend runtime
- [**Prisma Documentation**](https://www.prisma.io/docs) - Database toolkit
- [**TypeScript Handbook**](https://www.typescriptlang.org/docs/) - Type system

### Development Tools
- [**VS Code**](https://code.visualstudio.com/) - Recommended editor
- [**GitHub CLI**](https://cli.github.com/) - Command line interface
- [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) - Containerization
- [**Postman**](https://www.postman.com/) - API testing

### Project Documentation
- [**Getting Started**](GETTING_STARTED.md) - Quick setup guide
- [**API Reference**](API_REFERENCE.md) - Complete API documentation
- [**Architecture**](ARCHITECTURE.md) - System design overview
- [**Security**](SECURITY.md) - Security guidelines

---

## 🎉 Thank You!

Thank you for your interest in contributing to LezerPrint! Your contributions help make 3D printing more accessible and enjoyable for everyone.

**Questions?** Feel free to:
- Open a [discussion](https://github.com/Avi-Lezerovich/LezerPrint/discussions)
- Comment on relevant [issues](https://github.com/Avi-Lezerovich/LezerPrint/issues)
- Reach out to maintainers

**Ready to contribute?** Check out our [good first issues](https://github.com/Avi-Lezerovich/LezerPrint/labels/good%20first%20issue) and get started!

---

*Happy coding!* 🚀