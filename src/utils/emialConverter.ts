// Define your allowed frontend types
export type FrontendTemplateType = 'welcome' | 'password-reset' | 'course-completion';

// Define your allowed backend types
export type BackendTemplateType =
  | 'WELCOME_EMAIL'
  | 'PASSWORD_RESET_EMAIL'
  | 'COURSE_COMPLETION_EMAIL';

export const mapTypeToBackend = (type: FrontendTemplateType): BackendTemplateType => {
  switch (type) {
    case 'welcome':
      return 'WELCOME_EMAIL';
    case 'password-reset':
      return 'PASSWORD_RESET_EMAIL';
    case 'course-completion':
      return 'COURSE_COMPLETION_EMAIL';
  }
};

export const mapTypeToFrontend = (type: string): FrontendTemplateType => {
  switch (type) {
    case 'WELCOME_EMAIL':
      return 'welcome';
    case 'PASSWORD_RESET_EMAIL':
      return 'password-reset';
    case 'COURSE_COMPLETION_EMAIL':
      return 'course-completion';
    default:
      // fallback for unknown types
      return 'welcome';
  }
};
