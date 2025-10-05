# Component Inventory

This document describes all the UI components available in the LMS platform.

## Core UI Components

### Button (`src/components/ui/Button.tsx`)
Reusable button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean - Shows spinner when true
- `disabled`: boolean
- `children`: React.ReactNode

**Usage:**
```tsx
<Button variant="primary" size="md" loading={isSubmitting}>
  Save Changes
</Button>
```

### Input (`src/components/ui/Input.tsx`)
Form input component with label, error states, and help text.

**Props:**
- `label`: string - Input label
- `error`: string - Error message to display
- `helpText`: string - Help text below input
- All standard HTML input props

**Usage:**
```tsx
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={handleChange}
  error={errors.email}
  helpText="We'll never share your email"
/>
```

### Card (`src/components/ui/Card.tsx`)
Flexible card container with header, content, and footer sections.

**Components:**
- `Card`: Main container
- `CardHeader`: Header section with border
- `CardContent`: Main content area
- `CardFooter`: Footer section with background

**Props (Card):**
- `hover`: boolean - Enable hover effects
- `onClick`: () => void - Click handler
- `className`: string - Additional CSS classes

**Usage:**
```tsx
<Card hover onClick={handleClick}>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal (`src/components/ui/Modal.tsx`)
Overlay modal dialog with backdrop and keyboard navigation.

**Props:**
- `isOpen`: boolean - Controls modal visibility
- `onClose`: () => void - Close handler
- `title`: string - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `children`: React.ReactNode

**Features:**
- Escape key closes modal
- Click outside to close
- Focus trap
- Scroll lock

**Usage:**
```tsx
<Modal isOpen={showModal} onClose={closeModal} title="Edit Profile" size="lg">
  <form onSubmit={handleSubmit}>
    {/* Modal content */}
  </form>
</Modal>
```

## Layout Components

### AuthLayout (`src/layouts/AuthLayout.tsx`)
Layout for authentication pages (login, register, etc.).

**Features:**
- Centered card design
- Theme toggle
- Responsive layout
- Demo credentials display

### DashboardLayout (`src/layouts/DashboardLayout.tsx`)
Main application layout with sidebar navigation.

**Features:**
- Collapsible sidebar
- Role-based navigation
- User profile section
- Theme toggle
- "View as" indicator
- Mobile responsive

**Props:**
- `children`: React.ReactNode - Page content

## Specialized Components

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
Route wrapper that handles authentication and authorization.

**Props:**
- `children`: React.ReactNode
- `allowedRoles`: UserRole[] - Roles that can access this route

**Features:**
- Redirects unauthenticated users to login
- Redirects unauthorized users to appropriate dashboard
- Preserves intended destination

### FileUploader (Placeholder)
Component for handling file uploads with drag & drop.

**Planned Props:**
- `accept`: string - Allowed file types
- `maxSize`: number - Maximum file size
- `multiple`: boolean - Allow multiple files
- `onUpload`: (files: File[]) => void

### RichTextEditor (Placeholder)
Notion-like rich text editor for lesson content.

**Planned Features:**
- Markdown support
- Inline formatting
- Block elements (headers, lists, etc.)
- Image embedding
- Link insertion

### DataTable (Placeholder)
Sortable, filterable data table for admin interfaces.

**Planned Props:**
- `data`: any[] - Table data
- `columns`: Column[] - Column definitions
- `sortable`: boolean
- `filterable`: boolean
- `pagination`: PaginationOptions

### CSVImportModal (Placeholder)
Modal for bulk importing users via CSV.

**Planned Features:**
- CSV file selection
- Preview data
- Validation errors
- Import progress

### CoursePlayer (Placeholder)
Video player component for course lessons.

**Planned Features:**
- Multiple video sources (YouTube, Vimeo, direct)
- Playback controls
- Progress tracking
- Speed controls
- Fullscreen support

## Form Components

### FormField (Planned)
Wrapper component for consistent form field styling.

### Select (Planned)
Dropdown select component with search functionality.

### Textarea (Planned)
Multi-line text input with auto-resize.

### Checkbox (Planned)
Styled checkbox component.

### Radio (Planned)
Radio button group component.

### DatePicker (Planned)
Date selection component.

## Feedback Components

### Toast (Using react-hot-toast)
Notification system for user feedback.

**Usage:**
```tsx
import toast from 'react-hot-toast';

toast.success('Changes saved!');
toast.error('Something went wrong');
toast.loading('Saving...');
```

### LoadingSpinner (Planned)
Reusable loading indicator.

### EmptyState (Planned)
Component for displaying empty states.

### ErrorBoundary (Planned)
Error boundary component for error handling.

## Chart Components (Planned)

### LineChart
For analytics and progress visualization.

### BarChart
For course completion statistics.

### PieChart
For enrollment distribution.

### ProgressChart
For learning progress tracking.

## Usage Guidelines

1. **Consistency**: Always use these components instead of creating custom ones
2. **Accessibility**: All components include proper ARIA attributes
3. **Theming**: Components support light/dark mode via Tailwind
4. **Responsive**: Components work across all screen sizes
5. **TypeScript**: All components are fully typed

## Extending Components

When extending components:
1. Create new props with proper TypeScript types
2. Maintain backward compatibility
3. Update this documentation
4. Add proper accessibility attributes
5. Test across themes and screen sizes

## Integration Notes

### With Forms
Use with React Hook Form or similar libraries:

```tsx
const { register, formState: { errors } } = useForm();

<Input
  {...register('email', { required: 'Email is required' })}
  label="Email"
  error={errors.email?.message}
/>
```

### With State Management
Components work with any state management solution:

```tsx
// With useState
const [isOpen, setIsOpen] = useState(false);

// With Redux/Zustand
const isOpen = useAppSelector(state => state.ui.modalOpen);
```

### Styling Customization
Override styles using Tailwind classes:

```tsx
<Button className="bg-red-600 hover:bg-red-700">
  Custom Red Button
</Button>
```