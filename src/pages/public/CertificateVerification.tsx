import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  TrophyIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface PublicCertificateData {
  studentName: string;
  courseTitle?: string;
  organizationName: string;
  issueDate: string;
  credentialId: string;
  status: 'valid' | 'revoked';
  logoUrl?: string | null;
  downloadUrl?: string | null;
}

export function CertificateVerification() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const [certificate, setCertificate] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadCertificate();
  }, [credentialId]);

  const loadCertificate = async () => {
    if (!credentialId) return;

    try {
      setLoading(true);
      const data = await certificateService.verifyByCredentialId(credentialId);
      setCertificate(data);
      document.title = `Verify Certificate • ${data.studentName}`;
    } catch (err) {
      console.error('Failed to load certificate:', err);
      setError('Invalid or Revoked Certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificate?.downloadUrl) return;
    try {
      setDownloading(true);
      window.open(certificate.downloadUrl, '_blank', 'noopener,noreferrer');
      toast.success('Certificate downloaded!');
    } catch (err) {
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid or Revoked Certificate
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The certificate could not be verified.'}
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify the authenticity of this certificate
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Certificate Details
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${certificate.status === 'valid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                {certificate.status === 'valid' ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-1" />
                    Valid
                  </>
                ) : (
                  <>
                    <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                    Revoked
                  </>
                )}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                {certificate.logoUrl ? (
                  <img src={certificate.logoUrl} alt="Organization Logo" className="h-16 mx-auto mb-4 object-contain" />
                ) : (
                  <TrophyIcon className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
                )}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Certificate of Completion
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This certificate verifies that
                </p>
              </div>

              <div className="text-center mb-8">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {certificate.studentName}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  has successfully completed the
                </p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                  {certificate.courseTitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {certificate.organizationName}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {certificate.issueDate}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Credential ID</p>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-white break-all">
                    {certificate.credentialId}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleDownload}
                  disabled={downloading || !certificate.downloadUrl}
                  className="flex items-center justify-center"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  {downloading ? 'Downloading...' : 'Download Certificate'}
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Print Certificate
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Certificate Verified</span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                This certificate is authentic and was issued by {certificate.organizationName}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Having trouble with this certificate?{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
