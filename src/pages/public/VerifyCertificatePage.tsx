import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';
import { Button } from '../../components/ui/Button';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { CertificatePreview } from '../../components/student/CertificatePreview';
import { CertDetails } from '../../types';

// Step 1: Input Form Component
function VerifyForm({ onSubmit, loading }: { onSubmit: (id: string) => void; loading: boolean }) {
  const [credentialId, setCredentialId] = useState('');

  const handleSubmit = () => {
    if (credentialId.trim()) {
      onSubmit(credentialId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LMS Platform</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Verification</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Verify a Certificate
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter the credential ID printed on the certificate
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="credentialId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Credential ID
              </label>
              <input
                id="credentialId"
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="e.g. CERT-ABC123XYZ"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                autoComplete="off"
              />
            </div>
            <Button 
              type="button"
              className="w-full" 
              loading={loading}
              disabled={loading || !credentialId.trim()}
              onClick={handleSubmit}
            >
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </Button>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This verification is public and does not require an account
            </p>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Error Component
function VerifyError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LMS Platform</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Certificate Verification</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Certificate Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onRetry}>
                Try Again
              </Button>
              <Link to="/verify" className="text-sm text-blue-600 hover:text-blue-500">
                ← Back to Verification
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Success/Result Component
function VerifySuccess({ certificate }: { certificate: CertDetails }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">LMS Platform</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Verified
            </div>
            <div className="flex gap-3">
              <Link to="/verify">
                <Button variant="outline">
                  Verify Another
                </Button>
              </Link>
              <Button variant="outline" onClick={handlePrint}>
                Print Certificate
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <CertificatePreview certificate={certificate} />
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/verify" className="text-sm text-blue-600 hover:text-blue-500">
            ← Verify another certificate
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading Component
function VerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying certificate...</p>
    </div>
  );
}

// Main Page Component
export function VerifyCertificatePage() {
  const [certificate, setCertificate] = useState<CertDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCertificate = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.verifyCredentials({ credentialId: id });
      setCertificate(data);
      document.title = `Verify Certificate • ${data.studentName}`;
    } catch (err: any) {
      console.error('Failed to load certificate:', err);
      setError(err.message || 'Certificate not found or invalid credential ID');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (id: string) => {
    loadCertificate(id);
  };

  const handleRetry = () => {
    setError(null);
    setCertificate(null);
  };

  // loading state
  if (loading) {
    return <VerifyLoading />;
  }

  // show form if no certificate yet
  if (!certificate) {
    if (error) {
      return <VerifyError message={error} onRetry={handleRetry} />;
    }
    return <VerifyForm onSubmit={handleSubmit} loading={loading} />;
  }

  // success
  return <VerifySuccess certificate={certificate} />;
}
