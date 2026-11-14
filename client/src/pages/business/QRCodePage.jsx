import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
  Layers,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import queueService from '../../services/queue.service';

export default function QRCodePage() {
  const { queueId } = useParams();
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await queueService.getQueueById(queueId);
        setQueue(res?.data?.queue || res?.queue || res?.data);
      } catch (err) {
        setError(err.message || 'Failed to load queue details.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, [queueId]);

  // Construct absolute URL for public queue check-in
  const joinUrl = `${window.location.origin}/queue/${queueId}/join`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout title="Queue QR Code">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-blue-600 mb-2" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Check-in QR Code Poster"
      subtitle="Print or display this poster at your entrance so customers can scan and join"
      actions={
        <div className="flex items-center gap-2">
          <Link to={`/dashboard/queues/${queueId}`}>
            <Button variant="secondary" size="sm" icon={ArrowLeft}>
              Back to Desk
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Poster
          </Button>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        {/* Printable Poster Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-200 shadow-2xl text-center print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="inline-flex items-center gap-2 text-blue-600 font-extrabold text-lg mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <span>QueueLess</span>
          </div>

          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            {queue?.business?.name || 'Welcome to our location'}
          </h2>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mt-1 mb-2">
            Scan to Join Virtual Queue
          </h1>

          <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
            Line: <span className="font-bold text-gray-800">{queue?.name}</span> • No app download needed
          </p>

          {/* QR Code Graphic Frame */}
          <div className="inline-block p-6 sm:p-8 bg-white rounded-3xl border-4 border-slate-900 shadow-xl mb-8">
            <QRCodeSVG
              value={joinUrl}
              size={240}
              level="H"
              includeMargin={false}
              className="mx-auto"
            />
          </div>

          {/* Customer 3-step prompt */}
          <div className="max-w-md mx-auto grid grid-cols-3 gap-3 text-left pt-6 border-t border-gray-100">
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-gray-600">
              <span className="font-bold text-blue-600 block mb-1">1. Scan</span>
              Point your smartphone camera at the QR code.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-gray-600">
              <span className="font-bold text-blue-600 block mb-1">2. Token</span>
              Enter your name and get your live token.
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-gray-600">
              <span className="font-bold text-blue-600 block mb-1">3. Be Called</span>
              Relax anywhere until your screen turns blue!
            </div>
          </div>
        </div>

        {/* Digital Sharing Bar */}
        <Card title="Share Direct Check-in Link">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              readOnly
              value={joinUrl}
              className="w-full bg-slate-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-600 font-mono select-all focus:outline-none"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button
                variant={copied ? 'success' : 'secondary'}
                size="md"
                className="w-full sm:w-auto"
                icon={copied ? Check : Copy}
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>

              <a href={joinUrl} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                <Button variant="ghost" size="md" icon={ExternalLink} className="w-full sm:w-auto">
                  Test Link
                </Button>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

