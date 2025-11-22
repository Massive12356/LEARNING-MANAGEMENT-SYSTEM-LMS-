import { User, Course, Program, Certificate, CertificateTemplate } from '../types';

export interface CertificateData {
  studentName: string;
  courseName?: string;
  programName?: string;
  organizationName: string;
  completionDate: Date;
  issueDate: Date;
  instructorName?: string;
  grade?: number;
  credentialId: string;
  verificationUrl?: string;
  customFields?: Record<string, string>;
}

export interface CertificateDesign {
  id: string;
  name: string;
  template: 'modern' | 'classic' | 'elegant' | 'minimal' | 'corporate';
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  borderStyle: 'none' | 'simple' | 'ornate' | 'modern';
  fontFamily: string;
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
    footer: number;
  };
  layout: {
    orientation: 'landscape' | 'portrait';
    width: number;
    height: number;
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  logo?: {
    url: string;
    width: number;
    height: number;
    position: 'top-left' | 'top-center' | 'top-right' | 'center';
  };
  signature?: {
    name: string;
    title: string;
    imageUrl?: string;
  };
  watermark?: {
    text: string;
    opacity: number;
  };
  borderColor?: string;
  backgroundUrl?: string;
}

class CertificateService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  // Initialize canvas for certificate generation
  private initializeCanvas(design: CertificateDesign): void {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }

    if (this.canvas && this.ctx) {
      this.canvas.width = design.layout.width;
      this.canvas.height = design.layout.height;
      
      // Set high DPI for quality
      const dpr = window.devicePixelRatio || 1;
      this.canvas.style.width = design.layout.width + 'px';
      this.canvas.style.height = design.layout.height + 'px';
      this.canvas.width = design.layout.width * dpr;
      this.canvas.height = design.layout.height * dpr;
      this.ctx.scale(dpr, dpr);
    }
  }

  // Load font for certificate
  private async loadFont(fontFamily: string): Promise<void> {
    const fontUrl = this.getFontUrl(fontFamily);
    if (fontUrl) {
      const font = new FontFace(fontFamily, `url(${fontUrl})`);
      await font.load();
      document.fonts.add(font);
    }
  }

  // Get font URL from Google Fonts or other sources
  private getFontUrl(fontFamily: string): string | null {
    const fontMap: Record<string, string> = {
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
      'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
      'Lora': 'https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap'
    };
    
    return fontMap[fontFamily] || null;
  }

  // Draw background and border
  private drawBackground(design: CertificateDesign): void {
    if (!this.ctx || !this.canvas) return;

    const { width, height } = design.layout;
    
    // Background color
    this.ctx.fillStyle = design.backgroundColor;
    this.ctx.fillRect(0, 0, width, height);

    // Background image (if provided)
    if (design.backgroundUrl) {
      // Note: In a real implementation, you would draw the background image here
      // For now, we'll just log that it should be drawn
      console.log('Background image should be drawn:', design.backgroundUrl);
    }

    // Watermark
    if (design.watermark) {
      this.ctx.save();
      this.ctx.globalAlpha = design.watermark.opacity;
      this.ctx.fillStyle = design.textColor;
      this.ctx.font = '100px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.translate(width / 2, height / 2);
      this.ctx.rotate(-Math.PI / 6);
      this.ctx.fillText(design.watermark.text, 0, 0);
      this.ctx.restore();
    }

    // Border
    if (design.borderStyle !== 'none') {
      const borderColor = design.borderColor || design.primaryColor;
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 4;
      
      switch (design.borderStyle) {
        case 'simple':
          this.ctx.strokeRect(20, 20, width - 40, height - 40);
          break;
        case 'ornate':
          this.drawOrnateBorder(design);
          break;
        case 'modern':
          this.drawModernBorder(design);
          break;
      }
    }
  }

  // Draw ornate border
  private drawOrnateBorder(design: CertificateDesign): void {
    if (!this.ctx) return;

    const { width, height } = design.layout;
    const margin = 30;
    const borderColor = design.borderColor || design.primaryColor;
    
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    
    // Outer border
    this.ctx.strokeRect(margin, margin, width - 2 * margin, height - 2 * margin);
    
    // Inner border
    this.ctx.strokeRect(margin + 15, margin + 15, width - 2 * (margin + 15), height - 2 * (margin + 15));
    
    // Corner decorations
    const cornerSize = 20;
    const corners = [
      [margin + 15, margin + 15],
      [width - margin - 15, margin + 15],
      [margin + 15, height - margin - 15],
      [width - margin - 15, height - margin - 15]
    ];
    
    corners.forEach(([x, y]) => {
      this.ctx!.beginPath();
      this.ctx!.moveTo(x - cornerSize, y);
      this.ctx!.lineTo(x + cornerSize, y);
      this.ctx!.moveTo(x, y - cornerSize);
      this.ctx!.lineTo(x, y + cornerSize);
      this.ctx!.stroke();
    });
  }

  // Draw modern border
  private drawModernBorder(design: CertificateDesign): void {
    if (!this.ctx) return;

    const { width, height } = design.layout;
    const cornerLength = 40;
    const margin = 30;
    const borderColor = design.borderColor || design.primaryColor;
    
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 3;
    
    // Top-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(margin, margin + cornerLength);
    this.ctx.lineTo(margin, margin);
    this.ctx.lineTo(margin + cornerLength, margin);
    this.ctx.stroke();
    
    // Top-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(width - margin - cornerLength, margin);
    this.ctx.lineTo(width - margin, margin);
    this.ctx.lineTo(width - margin, margin + cornerLength);
    this.ctx.stroke();
    
    // Bottom-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(margin, height - margin - cornerLength);
    this.ctx.lineTo(margin, height - margin);
    this.ctx.lineTo(margin + cornerLength, height - margin);
    this.ctx.stroke();
    
    // Bottom-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(width - margin - cornerLength, height - margin);
    this.ctx.lineTo(width - margin, height - margin);
    this.ctx.lineTo(width - margin, height - margin - cornerLength);
    this.ctx.stroke();
  }

  // Draw logo
  private async drawLogo(design: CertificateDesign): Promise<void> {
    if (!design.logo || !this.ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
      img.onload = () => {
        if (!this.ctx || !design.logo) return;

        let x: number, y: number;
        const { width, height } = design.layout;
        
        switch (design.logo.position) {
          case 'top-left':
            x = design.layout.margins.left;
            y = design.layout.margins.top;
            break;
          case 'top-center':
            x = (width - design.logo.width) / 2;
            y = design.layout.margins.top;
            break;
          case 'top-right':
            x = width - design.layout.margins.right - design.logo.width;
            y = design.layout.margins.top;
            break;
          case 'center':
            x = (width - design.logo.width) / 2;
            y = (height - design.logo.height) / 2 - 100;
            break;
          default:
            x = design.layout.margins.left;
            y = design.layout.margins.top;
        }
        
        this.ctx!.drawImage(img, x, y, design.logo!.width, design.logo!.height);
        resolve();
      };
      
      img.onerror = () => resolve(); // Continue even if logo fails to load
      if (design.logo?.url) {
        img.src = design.logo.url;
      } else {
        resolve();
      }
    });
  }

  // Draw certificate text content
  private drawContent(data: CertificateData, design: CertificateDesign): void {
    if (!this.ctx) return;

    const { width, height } = design.layout;
    const centerX = width / 2;
    let currentY = height * 0.25;

    // Title
    this.ctx.fillStyle = design.primaryColor;
    this.ctx.font = `bold ${design.fontSize.title}px ${design.fontFamily}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CERTIFICATE OF COMPLETION', centerX, currentY);
    
    currentY += 80;

    // Student name
    this.ctx.fillStyle = design.textColor;
    this.ctx.font = `bold ${design.fontSize.subtitle}px ${design.fontFamily}`;
    this.ctx.fillText(data.studentName, centerX, currentY);
    
    currentY += 60;

    // Achievement text
    this.ctx.fillStyle = design.textColor;
    this.ctx.font = `${design.fontSize.body}px ${design.fontFamily}`;
    this.ctx.fillText('has successfully completed', centerX, currentY);
    
    currentY += 40;

    // Course/Program name
    this.ctx.fillStyle = design.primaryColor;
    this.ctx.font = `bold ${design.fontSize.subtitle}px ${design.fontFamily}`;
    const courseName = data.courseName || data.programName || 'the course';
    this.ctx.fillText(courseName, centerX, currentY);
    
    currentY += 60;

    // Organization and date
    this.ctx.fillStyle = design.textColor;
    this.ctx.font = `${design.fontSize.body}px ${design.fontFamily}`;
    this.ctx.fillText(
      `at ${data.organizationName} on ${data.completionDate.toLocaleDateString()}`,
      centerX,
      currentY
    );

    // Grade (if available)
    if (data.grade) {
      currentY += 40;
      this.ctx.fillText(`Final Grade: ${data.grade}%`, centerX, currentY);
    }

    // Credential ID
    currentY = height - 120;
    this.ctx.font = `${design.fontSize.footer}px ${design.fontFamily}`;
    this.ctx.fillStyle = design.accentColor;
    this.ctx.fillText(`Credential ID: ${data.credentialId}`, centerX, currentY);

    // Verification URL
    if (data.verificationUrl) {
      currentY += 25;
      this.ctx.fillText(`Verify at: ${data.verificationUrl}`, centerX, currentY);
    }
  }

  // Draw signature
  private async drawSignature(design: CertificateDesign): Promise<void> {
    if (!design.signature || !this.ctx) return;

    const { width, height } = design.layout;
    const signatureX = width - 200;
    const signatureY = height - 150;

    // Signature image (if available)
    if (design.signature.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          if (!this.ctx) return;
          this.ctx.drawImage(img, signatureX - 75, signatureY - 50, 150, 40);
          this.drawSignatureText(design, signatureX, signatureY);
          resolve();
        };
        
        img.onerror = () => {
          this.drawSignatureText(design, signatureX, signatureY);
          resolve();
        };
        
        img.src = design.signature!.imageUrl!;
      });
    } else {
      this.drawSignatureText(design, signatureX, signatureY);
    }
  }

  // Draw signature text
  private drawSignatureText(design: CertificateDesign, x: number, y: number): void {
    if (!this.ctx || !design.signature) return;

    this.ctx.fillStyle = design.textColor;
    this.ctx.font = `${design.fontSize.footer}px ${design.fontFamily}`;
    this.ctx.textAlign = 'center';
    
    // Line above signature
    this.ctx.beginPath();
    this.ctx.moveTo(x - 75, y - 10);
    this.ctx.lineTo(x + 75, y - 10);
    this.ctx.strokeStyle = design.textColor;
    this.ctx.stroke();
    
    // Name
    this.ctx.fillText(design.signature.name, x, y + 10);
    
    // Title
    this.ctx.fillText(design.signature.title, x, y + 30);
  }

  // Generate certificate
  async generateCertificate(
    data: CertificateData,
    design: CertificateDesign
  ): Promise<string> {
    try {
      // Initialize canvas
      this.initializeCanvas(design);
      
      if (!this.ctx || !this.canvas) {
        throw new Error('Failed to initialize canvas');
      }

      // Load font
      await this.loadFont(design.fontFamily);

      // Draw certificate components
      this.drawBackground(design);
      await this.drawLogo(design);
      this.drawContent(data, design);
      await this.drawSignature(design);

      // Convert to blob and return data URL
      return new Promise((resolve, reject) => {
        this.canvas!.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to generate certificate'));
          }
        }, 'image/png');
      });

    } catch (error) {
      throw new Error(`Certificate generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate PDF certificate (mock implementation)
  async generatePDFCertificate(
    data: CertificateData,
    design: CertificateDesign
  ): Promise<Blob> {
    // In a real implementation, you would use libraries like:
    // - jsPDF with html2canvas
    // - PDFKit
    // - Puppeteer for server-side generation
    
    const imageUrl = await this.generateCertificate(data, design);
    
    // Mock PDF generation - convert image to PDF
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // In reality, you'd embed the image into a PDF document
    return blob;
  }

  // Predefined certificate designs
  getDefaultDesigns(): CertificateDesign[] {
    return [
      {
        id: 'modern-blue',
        name: 'Modern Blue',
        template: 'modern',
        backgroundColor: '#ffffff',
        primaryColor: '#2563eb',
        accentColor: '#1d4ed8',
        textColor: '#374151',
        borderStyle: 'modern',
        fontFamily: 'Roboto',
        fontSize: { title: 36, subtitle: 24, body: 16, footer: 12 },
        layout: {
          orientation: 'landscape',
          width: 800,
          height: 600,
          margins: { top: 50, right: 50, bottom: 50, left: 50 }
        }
      },
      {
        id: 'elegant-gold',
        name: 'Elegant Gold',
        template: 'elegant',
        backgroundColor: '#fefce8',
        primaryColor: '#d97706',
        accentColor: '#92400e',
        textColor: '#374151',
        borderStyle: 'ornate',
        fontFamily: 'Playfair Display',
        fontSize: { title: 40, subtitle: 26, body: 18, footer: 14 },
        layout: {
          orientation: 'landscape',
          width: 800,
          height: 600,
          margins: { top: 60, right: 60, bottom: 60, left: 60 }
        }
      },
      {
        id: 'minimal-gray',
        name: 'Minimal Gray',
        template: 'minimal',
        backgroundColor: '#ffffff',
        primaryColor: '#6b7280',
        accentColor: '#4b5563',
        textColor: '#111827',
        borderStyle: 'simple',
        fontFamily: 'Open Sans',
        fontSize: { title: 32, subtitle: 20, body: 14, footer: 10 },
        layout: {
          orientation: 'landscape',
          width: 800,
          height: 600,
          margins: { top: 40, right: 40, bottom: 40, left: 40 }
        }
      }
    ];
  }

  // Generate verification URL
  generateVerificationUrl(certificateId: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify/${certificateId}`;
  }

  // Generate unique credential ID
  generateCredentialId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  }

  // Validate certificate data
  validateCertificateData(data: Partial<CertificateData>): string[] {
    const errors: string[] = [];

    if (!data.studentName?.trim()) {
      errors.push('Student name is required');
    }

    if (!data.organizationName?.trim()) {
      errors.push('Organization name is required');
    }

    if (!data.completionDate) {
      errors.push('Completion date is required');
    }

    if (!data.courseName?.trim() && !data.programName?.trim()) {
      errors.push('Course or program name is required');
    }

    return errors;
  }
}

export const certificateService = new CertificateService();