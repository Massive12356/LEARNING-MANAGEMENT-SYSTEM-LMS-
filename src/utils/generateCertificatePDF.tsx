import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';
import { CertificatePreview } from '../components/student/CertificatePreview';
import { CertDetails } from '../types';

function sanitizeFilenamePart(s: string): string {
  return s
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .trim();
}

async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve());
          img.addEventListener('error', () => resolve());
        })
    )
  );
}

export async function generateCertificatePDF(certificate: CertDetails): Promise<void> {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-99999px';
  host.style.top = '0';
  host.style.width = '1123px';
  host.style.height = '794px';
  host.style.backgroundColor = '#ffffff';
  host.setAttribute('aria-hidden', 'true');
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    root.render(<CertificatePreview certificate={certificate} />);
    await waitForImagesToLoad(host);

    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: false,
      removeContainer: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height / canvas.width) * imgWidth;
    const yOffset = Math.max(0, (pageHeight - imgHeight) / 2);

    pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);

    const name = sanitizeFilenamePart(certificate.certificateName);
    const cred = sanitizeFilenamePart(certificate.credentialId);
    const filename = `Certificate_${name}_${cred}.pdf`;
    pdf.save(filename);
  } finally {
    root.unmount();
    host.remove();
  }
}

