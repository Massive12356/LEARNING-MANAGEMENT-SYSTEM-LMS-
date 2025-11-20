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
    adminUserId: 'user-3',
    organizationCode: 'TECHACAD123',
    name: 'Tech Academy',
    status: 'active',
    description: 'Leading technology education platform for modern learners',
    logo: 'https://picsum.photos/200/200?random=1',
    primaryColor: '#3B82F6',
    emailCopyBranding: 'Best regards,\nThe Tech Academy Team',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    maxUsers: 1000,
    expiryDay: new Date('2025-01-01'),
    organizationDetails: {
      id: 1,
      code: 'TECHACAD123',
      name: 'Tech Academy'
    }
  },
  {
    id: 'org-2',
    adminUserId: 'user-3',
    organizationCode: 'BIZINST456',
    name: 'Business Skills Institute',
    status: 'active',
    description: 'Professional development and business skills training',
    logo: 'https://picsum.photos/200/200?random=2',
    primaryColor: '#10B981',
    emailCopyBranding: 'Sincerely,\nBusiness Skills Institute',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
    maxUsers: 500,
    expiryDay: new Date('2025-01-01'),
    organizationDetails: {
      id: 2,
      code: 'BIZINST456',
      name: 'Business Skills Institute'
    }
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

// Add the enhanced demo course with all content types
const enhancedDemoModules: Module[] = [
  {
    id: 'module-1',
    title: 'HTML Fundamentals',
    description: 'Learn the basics of HTML and semantic markup',
    order: 0,
    courseId: 'demo-course',
    lessons: [
      {
        id: 'lesson-1',
        title: 'Introduction to HTML',
        description: 'Understanding the structure of web pages',
        type: 'video',
        content: {
          videoUrl: 'https://www.youtube.com/watch?v=Ihy0QziLDf0',
          duration: 15
        },
        order: 0,
        moduleId: 'module-1',
        duration: 15,
        isRequired: true
      },
      {
        id: 'lesson-2',
        title: 'HTML Text Elements',
        description: 'Working with headings, paragraphs, and text formatting',
        type: 'text',
        content: {
          textContent: '<h3>HTML Text Elements</h3><p>In this lesson, we\'ll explore the various text elements available in HTML.</p><h4>Headings</h4><p>HTML provides six levels of headings, from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>.</p><h4>Paragraphs</h4><p>Paragraphs are defined with the <code>&lt;p&gt;</code> tag.</p>'
        },
        order: 1,
        moduleId: 'module-1',
        duration: 10,
        isRequired: true
      }
    ]
  },
  {
    id: 'module-2',
    title: 'CSS Styling',
    description: 'Make your websites beautiful with CSS',
    order: 1,
    courseId: 'demo-course',
    lessons: [
      {
        id: 'lesson-3',
        title: 'CSS Basics',
        description: 'Introduction to Cascading Style Sheets',
        type: 'video',
        content: {
          videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
          duration: 20
        },
        order: 0,
        moduleId: 'module-2',
        duration: 20,
        isRequired: true
      },
      {
        id: 'lesson-4',
        title: 'Layout Techniques',
        description: 'Modern CSS layout with Flexbox and Grid',
        type: 'pdf',
        content: {
          pdfUrl: 'https://css-tricks.com/wp-content/uploads/2018/03/CSS-Tricks-CSS-Layout-Landscapes.pdf'
        },
        order: 1,
        moduleId: 'module-2',
        duration: 25,
        isRequired: true
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Advanced Content Types',
    description: 'Working with different content formats',
    order: 2,
    courseId: 'demo-course',
    lessons: [
      {
        id: 'lesson-5',
        title: 'Interactive PDF Resources',
        description: 'Downloadable course materials and resources',
        type: 'pdf',
        content: {
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        },
        order: 0,
        moduleId: 'module-3',
        duration: 5,
        isRequired: false
      },
      {
        id: 'lesson-6',
        title: 'Project Files',
        description: 'Starter files for hands-on exercises',
        type: 'attachment',
        content: {
          attachmentUrl: 'https://example.com/starter-files.zip'
        },
        order: 1,
        moduleId: 'module-3',
        duration: 0,
        isRequired: true
      },
      {
        id: 'lesson-7',
        title: 'Knowledge Check',
        description: 'Test your understanding of key concepts',
        type: 'quiz',
        content: {
          quizData: null
        },
        order: 2,
        moduleId: 'module-3',
        duration: 15,
        isRequired: true
      },
      {
        id: 'lesson-8',
        title: 'Learning Reflection',
        description: 'Reflect on what you\'ve learned in this module',
        type: 'reflection',
        content: {
          reflectionPrompt: 'How will you apply what you\'ve learned in this module to your own projects?'
        },
        order: 3,
        moduleId: 'module-3',
        duration: 10,
        isRequired: false
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
  // Single comprehensive demo course for teachers to edit
  ,
  {
    id: 'demo-course',
    title: 'Web Development Fundamentals - Editable Template',
    description: '<p>This is a pre-created course template that you can customize for your students. It includes modules on HTML, CSS, and JavaScript fundamentals.</p><p><strong>How to use this template:</strong></p><ul><li>Edit the course title and description to match your needs</li><li>Modify the content of existing lessons</li><li>Add new lessons or modules</li><li>Change the order of modules and lessons</li><li>Upload your own videos and resources</li></ul>',
    coverImage: 'https://picsum.photos/800/450?random=4',
    tags: ['html', 'css', 'javascript', 'web development', 'beginner'],
    status: 'draft',
    isTracked: true,
    allowSelfPacing: true,
    requiresCertificate: true,
    isGraded: true,
    organizationId: 'org-1',
    teacherId: 'user-2',
    modules: [
      {
        id: 'module-1-template',
        title: 'HTML Basics',
        description: 'Learn the fundamentals of HTML markup',
        order: 0,
        courseId: 'demo-course',
        lessons: [
          {
            id: 'lesson-1-template',
            title: 'Introduction to HTML',
            description: 'Understanding the structure of web pages',
            type: 'video',
            content: {
              videoUrl: 'https://www.youtube.com/watch?v=Ihy0QziLDf0',
              duration: 15
            },
            order: 0,
            moduleId: 'module-1-template',
            duration: 15,
            isRequired: true
          },
          {
            id: 'lesson-2-template',
            title: 'HTML Text Elements',
            description: 'Working with headings, paragraphs, and text formatting',
            type: 'text',
            content: {
              textContent: '<h3>HTML Text Elements</h3><p>In this lesson, we\'ll explore the various text elements available in HTML.</p><h4>Headings</h4><p>HTML provides six levels of headings, from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>.</p><h4>Paragraphs</h4><p>Paragraphs are defined with the <code>&lt;p&gt;</code> tag.</p>'
            },
            order: 1,
            moduleId: 'module-1-template',
            duration: 10,
            isRequired: true
          }
        ]
      },
      {
        id: 'module-2-template',
        title: 'CSS Styling',
        description: 'Style your web pages with CSS',
        order: 1,
        courseId: 'demo-course',
        lessons: [
          {
            id: 'lesson-3-template',
            title: 'CSS Basics',
            description: 'Introduction to Cascading Style Sheets',
            type: 'video',
            content: {
              videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
              duration: 20
            },
            order: 0,
            moduleId: 'module-2-template',
            duration: 20,
            isRequired: true
          },
          {
            id: 'lesson-4-template',
            title: 'Layout Techniques',
            description: 'Modern CSS layout with Flexbox and Grid',
            type: 'pdf',
            content: {
              pdfUrl: 'https://css-tricks.com/wp-content/uploads/2018/03/CSS-Tricks-CSS-Layout-Landscapes.pdf'
            },
            order: 1,
            moduleId: 'module-2-template',
            duration: 25,
            isRequired: true
          }
        ]
      },
      {
        id: 'module-3-template',
        title: 'JavaScript Fundamentals',
        description: 'Add interactivity to your websites',
        order: 2,
        courseId: 'demo-course',
        lessons: [
          {
            id: 'lesson-5-template',
            title: 'JavaScript Variables and Data Types',
            description: 'Learn about variables and data types in JavaScript',
            type: 'video',
            content: {
              videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
              duration: 18
            },
            order: 0,
            moduleId: 'module-3-template',
            duration: 18,
            isRequired: true
          },
          {
            id: 'lesson-6-template',
            title: 'DOM Manipulation',
            description: 'Interacting with HTML elements using JavaScript',
            type: 'text',
            content: {
              textContent: '<h3>DOM Manipulation</h3><p>The Document Object Model (DOM) is a programming interface for web documents.</p><p>It represents the page so that programs can change the document structure, style, and content.</p>'
            },
            order: 1,
            moduleId: 'module-3-template',
            duration: 15,
            isRequired: true
          }
        ]
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
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