import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { CertificatePreview } from '../../components/student/CertificatePreview';
import { CertDetails } from '../../types';

type PublicCertificateData = CertDetails;

export function CertificateVerification() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const [certificate, setCertificate] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    const loadCertificate = async () => {
      if (!credentialId || cancelled) return;

      try {
        setLoading(true);
        setError(null);
        const data = await certificateService.verifyByCredentialId(credentialId);
        
        if (!cancelled) {
          setCertificate(data);
          document.title = `Verify Certificate • ${data.studentName}`;
        }
      } catch (err) {
        console.error('Failed to load certificate:', err);
        if (!cancelled) {
          setError('Certificate not found or invalid credential ID');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCertificate();
    
    return () => {
      cancelled = true;
    };
  }, [credentialId]);

  const handlePrint = () => {
    window.print();
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
              Certificate Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'The certificate could not be verified.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/verify">
                <Button>
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Try Again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Verify the authenticity of this certificate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Verified
            </div>
            <div className="flex gap-2">
              <Link to="/verify">
                <Button variant="outline">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Verify Another
                </Button>
              </Link>
              <Button variant="outline" onClick={handlePrint}>
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Print
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <CertificatePreview certificate={certificate as CertDetails} />
          </div>
        </div>
      </div>
    </div>
  );
}
