import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { CertificatePreview } from '../../components/student/CertificatePreview';
import { CertDetails } from '../../types';
import { generateCertificatePDF } from '../../utils/generateCertificatePDF.tsx';
import toast from 'react-hot-toast';

export const CertificatePreviewPage: React.FC = () => {
  const { certificateId } = useParams();
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const certificate: CertDetails | null = useMemo(() => {
    if (!certificateId) return null;
    const raw = sessionStorage.getItem(`certificate_preview_${certificateId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CertDetails;
    } catch {
      return null;
    }
  }, [certificateId]);

  const handleDownload = async () => {
    if (!certificate) {
      toast.error('Certificate data not available');
      return;
    }
    try {
      setDownloading(true);
      await generateCertificatePDF(certificate);
      toast.success('Certificate downloaded');
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Certificate Preview
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Close Window
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {!certificate ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Certificate data not found. Open preview from your dashboard.
              </p>
              <div className="mt-4">
                <Link to="/student/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <div className="mx-auto bg-white rounded shadow">
            <CertificatePreview certificate={certificate} />
          </div>
        </div>
      )}
    </div>
  );
};
