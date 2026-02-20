import { useState, useEffect } from 'react';
import { CertDetails } from '../../types';
import { QRCodeCanvas } from 'qrcode.react';

export interface CertificatePreviewProps {
  certificate: CertDetails;
  className?: string;
}

function normalizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return url.replace(/[`'"\s]/g, '');
}

function toDisplayDate(input: string): string {
  const d = new Date(input);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  return input;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  certificate,
  className = '',
}) => {
  const accent = certificate.template?.accentColor ?? '#2563eb';
  const textColor = certificate.template?.defaultTextColor ?? '#111827';

  const orgLogo = normalizeUrl(certificate.organization?.logo ?? undefined);
  const courseTitle = certificate.course?.courseTitle ?? '';
  const orgName = certificate.organization?.name ?? '';
  const issueDate = toDisplayDate(certificate.acquiredDate);

  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (certificate?.enrollmentId) {
      setVerificationUrl(
        `${window.location.origin}/verify/${certificate.enrollmentId}`
      );
    }
  }, [certificate?.enrollmentId]);

  return (
    <div
      className={`bg-white ${className}`}
      style={{ width: 1123, height: 794 }}
    >
      {/* CERTIFICATE CONTAINER */}
      <div
        className="relative w-full h-full rounded-2xl flex flex-col justify-between p-8 box-border"
        style={{ border: `10px solid ${accent}` }}
      >
        {/* 🔒 TOP-LEFT QR CODE */}
        {verificationUrl && (
          <div className="absolute top-6 left-6 bg-white p-2 rounded-lg shadow-sm flex flex-col items-center">
            <QRCodeCanvas
              value={verificationUrl}
              size={78}
              bgColor="#ffffff"
              fgColor={accent}
              level="H"
              includeMargin
            />
          </div>
        )}

        {/* HEADER */}
        <div className="w-full">
          <div className="flex items-center justify-center mb-4">
            {orgLogo && (
              <img
                src={orgLogo}
                alt="Organization Logo"
                className="h-14 object-contain mr-3"
              />
            )}
            <span className="text-lg font-semibold text-gray-700">
              {orgName || 'Organization'}
            </span>
          </div>

          <div className="text-center mt-2">
            <h1
              className="text-4xl font-extrabold tracking-wide"
              style={{ color: accent }}
            >
              CERTIFICATE
            </h1>
            <p className="text-xl font-semibold text-gray-500 mt-1">
              OF COMPLETION
            </p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="text-center">
          <p className="text-gray-500 text-base">
            This is to certify that
          </p>

          <h2
            className="text-4xl font-extrabold mt-2"
            style={{ color: textColor }}
          >
            {certificate.studentName}
          </h2>

          <p className="text-gray-500 text-base mt-3">
            has successfully completed the
          </p>

          <p
            className="text-2xl font-bold mt-2"
            style={{ color: accent }}
          >
            {courseTitle}
          </p>
        </div>

        {/* FOOTER */}
        <div className="w-full">
          {/* META INFO */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Issued On</p>
              <p
                className="text-sm font-semibold"
                style={{ color: textColor }}
              >
                {issueDate}
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Credential ID</p>
              <p
                className="text-sm font-semibold font-mono break-words"
                style={{ color: textColor }}
              >
                {certificate.credentialId}
              </p>
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="h-px bg-gray-200 mb-1" />
              <div className="uppercase font-bold text-zinc-800">
                {certificate.courseTeacher?.firstName}{' '}
                {certificate.courseTeacher?.lastName}
              </div>
            </div>

            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xs font-bold mx-8"
              style={{
                border: `3px solid ${accent}`,
                color: accent,
              }}
            >
              SEAL
            </div>

            <div className="flex-1 text-center">
              <div className="h-px bg-gray-200 mb-1" />
              <div className="text-xs text-gray-500">
                Administrator
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
