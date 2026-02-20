import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AcademicCapIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function VerifyCertificateInput() {
  const [credentialId, setCredentialId] = useState('');
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialId.trim()) {
      toast.error('Please enter a credential ID');
      return;
    }
    try {
      setSubmitting(true);
      navigate(`/verify/${encodeURIComponent(credentialId.trim())}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify a Certificate
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Enter the credential ID printed on the certificate or embedded in the QR code.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Credential ID"
                placeholder="e.g. CERT-ABC123XYZ"
                name="credentialId"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
              />
              <Button type="submit" className="w-full" loading={submitting}>
                <QrCodeIcon className="h-5 w-5 mr-2" />
                Verify Certificate
              </Button>
            </form>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              This verification is public and does not require an account.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
