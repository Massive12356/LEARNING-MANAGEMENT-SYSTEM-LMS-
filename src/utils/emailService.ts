// Email service utility for sending notifications
// TODO: Replace with real email service integration (SendGrid, Mailgun, etc.)

import { EmailTemplate, User } from '../types';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailTemplateData {
  template: EmailTemplate;
  variables: Record<string, string>;
  recipient: User;
}

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;

  private constructor() {
    // TODO: Load from environment variables
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY || 'mock-api-key';
    this.fromEmail = 'noreply@lmsplatform.com';
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Send individual email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // TODO: Replace with real email service
      /*
      // SendGrid example:
      import sgMail from '@sendgrid/mail';
      
      sgMail.setApiKey(this.apiKey);
      
      const msg = {
        to: emailData.to,
        from: emailData.from || this.fromEmail,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      };
      
      await sgMail.send(msg);
      return true;
      */

      // Mailgun example:
      /*
      const formData = new FormData();
      formData.append('from', emailData.from || this.fromEmail);
      formData.append('to', emailData.to);
      formData.append('subject', emailData.subject);
      formData.append('html', emailData.html);
      if (emailData.text) formData.append('text', emailData.text);
      
      const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.apiKey}`)}`
        },
        body: formData
      });
      
      return response.ok;
      */

      // Mock implementation
      console.log('📧 Email sent (mock):', {
        to: emailData.to,
        subject: emailData.subject,
        preview: emailData.html.substring(0, 100) + '...'
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Send email using template
  async sendTemplatedEmail(data: EmailTemplateData): Promise<boolean> {
    const processedTemplate = this.processTemplate(data.template, data.variables);
    
    return this.sendEmail({
      to: data.recipient.email,
      subject: processedTemplate.subject,
      html: processedTemplate.body,
      text: this.htmlToText(processedTemplate.body)
    });
  }

  // Send bulk emails
  async sendBulkEmails(emails: EmailData[]): Promise<{ sent: number; failed: number; errors: string[] }> {
    const results = { sent: 0, failed: 0, errors: [] as string[] };
    
    // TODO: Use proper bulk email API for better performance
    for (const email of emails) {
      try {
        const success = await this.sendEmail(email);
        if (success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${email.to}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error sending to ${email.to}: ${error}`);
      }
    }
    
    return results;
  }

  // Process email template with variables
  private processTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string; body: string } {
    let processedSubject = template.subject;
    let processedBody = template.body;

    // Replace variables in subject and body
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
      processedBody = processedBody.replace(new RegExp(placeholder, 'g'), value);
    });

    // Convert plain text to HTML if needed
    if (!processedBody.includes('<')) {
      processedBody = processedBody.replace(/\n/g, '<br>');
      processedBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${processedSubject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${processedBody}
        </body>
        </html>
      `;
    }

    return {
      subject: processedSubject,
      body: processedBody
    };
  }

  // Convert HTML to plain text
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Predefined email templates
  static getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'welcome',
        type: 'welcome',
        subject: 'Welcome to {{organizationName}}!',
        body: `Hi {{firstName}},

Welcome to {{organizationName}}! We're excited to have you join our learning community.

To get started:
1. Complete your profile setup
2. Browse our course catalog
3. Enroll in your first course

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The {{organizationName}} Team

---
This email was sent to {{email}}. If you didn't create an account, please ignore this email.`,
        variables: ['firstName', 'organizationName', 'email']
      },
      {
        id: 'password-reset',
        type: 'password-reset',
        subject: 'Reset your password for {{organizationName}}',
        body: `Hi {{firstName}},

You requested a password reset for your {{organizationName}} account.

Click the link below to reset your password:
{{resetLink}}

This link will expire in 24 hours. If you didn't request a password reset, please ignore this email.

Best regards,
The {{organizationName}} Team

---
This email was sent to {{email}}.`,
        variables: ['firstName', 'organizationName', 'resetLink', 'email']
      },
      {
        id: 'course-completion',
        type: 'course-completion',
        subject: 'Congratulations! You completed {{courseName}}',
        body: `Hi {{firstName}},

Congratulations on completing {{courseName}}!

{{#if certificateAvailable}}
Your certificate is now available for download. You can access it from your student dashboard.
{{/if}}

We hope you enjoyed the course and learned valuable skills. Don't forget to check out our other courses to continue your learning journey.

Best regards,
The {{organizationName}} Team`,
        variables: ['firstName', 'courseName', 'organizationName', 'certificateAvailable']
      }
    ];
  }
}

// Utility functions for common email scenarios
export const emailUtils = {
  // Send welcome email to new user
  async sendWelcomeEmail(user: User, organizationName: string): Promise<boolean> {
    const emailService = EmailService.getInstance();
    const templates = EmailService.getDefaultTemplates();
    const welcomeTemplate = templates.find(t => t.type === 'welcome');
    
    if (!welcomeTemplate) {
      throw new Error('Welcome email template not found');
    }

    return emailService.sendTemplatedEmail({
      template: welcomeTemplate,
      recipient: user,
      variables: {
        firstName: user.firstName,
        organizationName,
        email: user.email
      }
    });
  },

  // Send password reset email
  async sendPasswordResetEmail(user: User, resetLink: string, organizationName: string): Promise<boolean> {
    const emailService = EmailService.getInstance();
    const templates = EmailService.getDefaultTemplates();
    const resetTemplate = templates.find(t => t.type === 'password-reset');
    
    if (!resetTemplate) {
      throw new Error('Password reset email template not found');
    }

    return emailService.sendTemplatedEmail({
      template: resetTemplate,
      recipient: user,
      variables: {
        firstName: user.firstName,
        organizationName,
        resetLink,
        email: user.email
      }
    });
  },

  // Send course completion email
  async sendCourseCompletionEmail(
    user: User, 
    courseName: string, 
    organizationName: string, 
    hasCertificate: boolean
  ): Promise<boolean> {
    const emailService = EmailService.getInstance();
    const templates = EmailService.getDefaultTemplates();
    const completionTemplate = templates.find(t => t.type === 'course-completion');
    
    if (!completionTemplate) {
      throw new Error('Course completion email template not found');
    }

    return emailService.sendTemplatedEmail({
      template: completionTemplate,
      recipient: user,
      variables: {
        firstName: user.firstName,
        courseName,
        organizationName,
        certificateAvailable: hasCertificate ? 'true' : 'false'
      }
    });
  }
};

export default EmailService;