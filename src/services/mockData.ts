import { User, Course, Program, Organization, Module, Lesson, UserRole } from '../types';

// Demo user credentials for testing
export const demoCredentials = {
  student: { email: 'john.student@example.com', password: 'password123' },
  teacher: { email: 'jane.teacher@example.com', password: 'password123' },
  admin: { email: 'admin@example.com', password: 'password123' },
  superuser: { email: 'super@example.com', password: 'password123' }
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.student@example.com',
    firstName: 'John',
    lastName: 'Student',
    role: 'student' as UserRole,
    organizationId: 'org-1',
    birthday: '1995-06-15',
    country: 'United States',
    gender: 'male',
    levelOfEducation: 'bachelor',
    isArchived: false,
    lastLogin: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    email: 'jane.teacher@example.com',
    firstName: 'Jane',
    lastName: 'Teacher',
    role: 'teacher' as UserRole,
    organizationId: 'org-1',
    birthday: '1988-03-22',
    country: 'Canada',
    gender: 'female',
    levelOfEducation: 'master',
    isArchived: false,
    lastLogin: new Date('2024-01-14'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: 'user-3',
    email: 'admin@example.com',
    firstName: 'Alex',
    lastName: 'Admin',
    role: 'admin' as UserRole,
    organizationId: 'org-1',
    birthday: '1985-11-08',
    country: 'United Kingdom',
    gender: 'non-binary',
    levelOfEducation: 'master',
    isArchived: false,
    lastLogin: new Date('2024-01-16'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'user-4',
    email: 'super@example.com',
    firstName: 'Super',
    lastName: 'User',
    role: 'superuser' as UserRole,
    birthday: '1982-09-12',
    country: 'Australia',
    gender: 'male',
    levelOfEducation: 'phd',
    isArchived: false,
    lastLogin: new Date('2024-01-16'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-16'),
  }
];

export const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Tech Academy',
    status: 'active',
    description: 'Leading technology education platform for modern learners',
    logo: 'https://picsum.photos/200/200?random=1',
    primaryColor: '#3B82F6',
    emailCopyBranding: 'Best regards,\nThe Tech Academy Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'org-2',
    name: 'Business Skills Institute',
    status: 'active',
    description: 'Professional development and business skills training',
    logo: 'https://picsum.photos/200/200?random=2',
    primaryColor: '#10B981',
    emailCopyBranding: 'Sincerely,\nBusiness Skills Institute',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  }
];

const sampleModules: Module[] = [
  {
    id: 'module-1',
    title: 'Introduction to React',
    description: 'Learn the basics of React development',
    order: 1,
    courseId: 'course-1',
    lessons: [
      {
        id: 'lesson-1',
        title: 'What is React?',
        description: 'Understanding React fundamentals',
        type: 'video',
        content: {
          type: 'embed',
          embedUrl: 'https://www.youtube.com/embed/l9AzO1FMgM8'
        },
        order: 1,
        moduleId: 'module-1',
        duration: 15,
        isRequired: true,
      },
      {
        id: 'lesson-2',
        title: 'Setting up your Environment',
        description: 'Installing Node.js and creating your first React app',
        type: 'text',
        content: {
          html: '<h2>Setting up React Development Environment</h2><p>In this lesson, we will learn how to set up a React development environment...</p>'
        },
        order: 2,
        moduleId: 'module-1',
        duration: 20,
        isRequired: true,
      },
      {
        id: 'lesson-3',
        title: 'React Basics Quiz',
        description: 'Test your understanding of React fundamentals',
        type: 'quiz',
        content: {
          quizId: 'quiz-1'
        },
        order: 3,
        moduleId: 'module-1',
        isRequired: true,
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Components and Props',
    description: 'Deep dive into React components',
    order: 2,
    courseId: 'course-1',
    lessons: [
      {
        id: 'lesson-4',
        title: 'Understanding Components',
        description: 'Learn about functional and class components',
        type: 'video',
        content: {
          type: 'embed',
          embedUrl: 'https://www.youtube.com/embed/l9AzO1FMgM8'
        },
        order: 1,
        moduleId: 'module-2',
        duration: 25,
        isRequired: true,
      }
    ]
  }
];

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Complete React Development Course',
    description: 'Learn React from scratch with hands-on projects and real-world examples. This comprehensive course covers everything from basic concepts to advanced patterns.',
    coverImage: 'https://picsum.photos/800/400?random=1',
    tags: ['react', 'javascript', 'frontend', 'web-development'],
    status: 'live',
    isTracked: true,
    allowSelfPacing: true,
    requiresCertificate: true,
    isGraded: true,
    organizationId: 'org-1',
    teacherId: 'user-2',
    modules: sampleModules,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'course-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Master advanced TypeScript concepts and design patterns for scalable applications.',
    coverImage: 'https://picsum.photos/800/400?random=2',
    tags: ['typescript', 'javascript', 'patterns', 'advanced'],
    status: 'live',
    isTracked: true,
    allowSelfPacing: true,
    requiresCertificate: true,
    isGraded: true,
    organizationId: 'org-1',
    teacherId: 'user-2',
    modules: [
      {
        id: 'module-3',
        title: 'TypeScript Advanced Concepts',
        description: 'Deep dive into advanced TypeScript features',
        order: 1,
        courseId: 'course-2',
        lessons: [
          {
            id: 'lesson-5',
            title: 'Advanced Types',
            description: 'Learn about advanced type system features',
            type: 'video',
            content: {
              type: 'embed',
              embedUrl: 'https://www.youtube.com/embed/l9AzO1FMgM8'
            },
            order: 1,
            moduleId: 'module-3',
            duration: 30,
            isRequired: true,
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'course-3',
    title: 'Business Leadership Fundamentals',
    description: 'Essential leadership skills for modern business professionals.',
    coverImage: 'https://picsum.photos/800/400?random=3',
    tags: ['leadership', 'business', 'management', 'professional'],
    status: 'draft',
    isTracked: true,
    allowSelfPacing: false,
    requiresCertificate: true,
    isGraded: false,
    organizationId: 'org-2',
    teacherId: 'user-3',
    modules: [
      {
        id: 'module-4',
        title: 'Leadership Principles',
        description: 'Core principles of effective leadership',
        order: 1,
        courseId: 'course-3',
        lessons: [
          {
            id: 'lesson-6',
            title: 'Introduction to Leadership',
            description: 'Understanding what makes a great leader',
            type: 'video',
            content: {
              type: 'embed',
              embedUrl: 'https://www.youtube.com/embed/l9AzO1FMgM8'
            },
            order: 1,
            moduleId: 'module-4',
            duration: 20,
            isRequired: true,
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
  }
];

export const mockPrograms: Program[] = [
  {
    id: 'program-1',
    title: 'Full Stack Web Development',
    description: 'Complete program covering frontend and backend development with modern technologies.',
    coverImage: 'https://picsum.photos/800/400?random=4',
    status: 'live',
    requiresCertificate: true,
    organizationId: 'org-1',
    courseIds: ['course-1', 'course-2'],
    requiredOrder: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'program-2',
    title: 'Business Leadership Track',
    description: 'Comprehensive leadership development program for business professionals.',
    coverImage: 'https://picsum.photos/800/400?random=5',
    status: 'draft',
    requiresCertificate: true,
    organizationId: 'org-2',
    courseIds: ['course-3'],
    requiredOrder: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  }
];

// Sample CSV data for bulk user import
export const sampleUserCSV = `firstName,lastName,email,role,organizationId,birthday,country,gender,levelOfEducation
John,Doe,john.doe@example.com,student,org-1,1995-05-15,United States,male,bachelor
Jane,Smith,jane.smith@example.com,student,org-1,1992-08-22,Canada,female,master
Mike,Johnson,mike.johnson@example.com,teacher,org-1,1985-12-03,United Kingdom,male,phd`;

// Sample quiz data
export const sampleQuizData = {
  'quiz-1': {
    id: 'quiz-1',
    title: 'React Basics Quiz',
    description: 'Test your understanding of React fundamentals',
    questions: [
      {
        id: 'q1',
        question: 'What is React?',
        type: 'multiple-choice',
        options: [
          'A JavaScript library for building user interfaces',
          'A database management system',
          'A CSS framework',
          'A server-side programming language'
        ],
        correctAnswer: 'A JavaScript library for building user interfaces',
        explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly for web applications.'
      },
      {
        id: 'q2',
        question: 'What is JSX?',
        type: 'short-text',
        correctAnswer: 'JavaScript XML',
        explanation: 'JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript.'
      }
    ],
    isGraded: true,
    passingScore: 70,
    lessonId: 'lesson-3'
  }
};