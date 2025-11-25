# LMS Platform

A modern, production-ready Learning Management System built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication** - Student, Teacher, Admin, and Superuser roles
- **Course Management** - Create, edit, and organize courses with rich content
- **Program Builder** - Group courses into learning programs
- **Progress Tracking** - Comprehensive student progress and analytics
- **Certificate Generation** - Automated certificates upon course completion
- **Organization Management** - Multi-tenant support with branding
- **Responsive Design** - Mobile-first, works on all devices
- **Dark/Light Mode** - User preference with persistence

### Content Types
- **Video Lessons** - Support for YouTube, Vimeo, Loom, and file uploads
- **Rich Text Content** - Notion-like editor for text-based lessons
- **PDF Documents** - Upload and embed PDF resources
- **Knowledge Checks** - Quizzes and assessments with automatic grading
- **Reflection Exercises** - Student submissions with file uploads
- **Attachments** - Support for various file types

### Advanced Features
- **Bulk User Import** - CSV-based user management
- **Email Templates** - Customizable notification system
- **View As** - Admin ability to view platform as other users
- **Analytics Dashboard** - Comprehensive reporting and insights
- **File Management** - Integrated file upload and storage
- **Certificate Templates** - Customizable completion certificates

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand (migrating from React Context)
- **UI Components**: Custom component library
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Development**: ESLint, Prettier

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements (Button, Input, Card, Modal)
│   └── COMPONENTS.md    # Component documentation
├── contexts/            # React context providers (deprecated, migrating to stores)
├── stores/              # Zustand stores for state management
│   ├── authStore.ts     # Authentication state
│   ├── uiStore.ts       # UI state (theme, sidebar)
│   ├── notificationStore.ts # Notification state
│   └── README.md        # Store documentation
├── hooks/               # Custom React hooks
├── layouts/             # Layout components
│   ├── AuthLayout.tsx   # Authentication pages layout
│   └── DashboardLayout.tsx # Main app layout
├── pages/               # Page components organized by role
│   ├── auth/           # Login, register, password reset
│   ├── student/        # Student-specific pages
│   ├── teacher/        # Teacher-specific pages
│   ├── admin/          # Admin-specific pages
│   └── superuser/      # Superuser-specific pages
├── services/            # API and external services
│   ├── mockApi.ts      # Mock API for development
│   └── mockData.ts     # Sample data
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── csvParser.ts    # CSV import/export utilities
│   ├── certificateGenerator.ts # Certificate generation
│   └── emailService.ts # Email notification service
└── routes/             # Route configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd lms-platform
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:5173`

### Demo Credentials

Use these credentials to test different user roles:

- **Student**: john.student@example.com / password123
- **Teacher**: jane.teacher@example.com / password123
- **Admin**: admin@example.com / password123
- **Superuser**: super@example.com / password123

## 📊 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run seed     # Seed database with sample data (planned)
```

## 🔧 Configuration



## 🔌 API Integration

Currently using a mock API for development. To integrate with a real backend:

### 1. Replace Mock API

Update `src/services/mockApi.ts` with real API calls:

```typescript
// Before (Mock)
async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
  await delay();
  // Mock logic...
}

// After (Real API)
async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
}
```

### 3. Recommended Backend Stack

- **Runtime**: Node.js with Express or NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **File Storage**: AWS S3 or Cloudinary
- **Video Hosting**: Mux or Vimeo
- **Email**: SendGrid or Mailgun
- **Payments**: Stripe or PayStack

## 🎨 Customization

### Theming

Update Tailwind configuration in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... your brand colors
        }
      }
    }
  }
}
```

### Branding

Update organization settings in mock data or admin panel:

- Logo upload
- Primary colors
- Email templates
- Certificate templates

## 📱 Features by Role

### Student
- Course catalog and enrollment
- Video lessons with progress tracking
- Quizzes and assessments
- Certificate downloads
- Personal progress reports
- Account settings

### Teacher
- Course creation and editing
- Module and lesson management
- Student progress monitoring
- Quiz/assessment builder
- Course analytics

### Admin
- User management and bulk import
- Organization settings and branding
- Email template customization
- Course and program oversight
- Comprehensive reporting
- "View as" functionality

### Superuser
- Multi-organization management
- System-wide analytics
- Global settings
- Organization comparison reports

## 🚧 Development Roadmap

### Phase 1 (MVP) ✅
- [x] Authentication system
- [x] Basic course management
- [x] Student enrollment
- [x] Progress tracking
- [x] Role-based access

### Phase 2 (Current)
- [x] Zustand state management implementation
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced search

### Phase 3 (Future)
- [ ] AI-powered recommendations
- [ ] Gamification features
- [ ] Social learning features
- [ ] Advanced integrations
- [ ] White-label solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper error handling
- Include loading states
- Write accessible HTML
- Test across different user roles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:

1. Check the documentation in each component file
2. Review the mock data structure in `src/services/mockData.ts`
3. Look at similar implementations in existing pages
4. Create an issue for bugs or feature requests

## 🔍 Key Files

- `src/types/index.ts` - All TypeScript type definitions
- `src/services/mockApi.ts` - API service with mock implementations
- `src/routes/index.tsx` - Route configuration and protection
- `src/stores/` - Zustand stores for state management
- `src/utils/` - Utility functions for CSV, certificates, and email

---

Built with ❤️ for modern education