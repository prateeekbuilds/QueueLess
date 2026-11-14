import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Users, Clock, AlertCircle, ArrowRight, Building, CheckCircle2, Layers } from 'lucide-react';
import queueService from '../../services/queue.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

export default function JoinQueue() {
  const { queueId } = useParams();
  const navigate = useNavigate();

  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Check if customer already has an active entry stored in localStorage for this queue
  useEffect(() => {
    const savedEntry = localStorage.getItem(`queueless_entry_${queueId}`);
    if (savedEntry) {
      try {
        const parsed = JSON.parse(savedEntry);
        if (parsed?.id) {
          navigate(`/queue/${queueId}/status/${parsed.id}`, { replace: true });
          return;
        }
      } catch (e) {
        // invalid JSON in localStorage, clear it
        localStorage.removeItem(`queueless_entry_${queueId}`);
      }
    }

    // Fetch public queue info
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await queueService.getPublicQueueInfo(queueId);
        const data = res?.data?.queue || res?.data || res;
        setQueueInfo(data);
      } catch (err) {
        setError(err.message || 'Unable to load queue information.');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [queueId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await queueService.joinQueue(queueId, {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
      });

      const entry = res?.data?.entry || res?.entry || res?.data;

      if (entry?.id) {
        // Save to localStorage for quick resumption
        localStorage.setItem(
          `queueless_entry_${queueId}`,
          JSON.stringify({
            id: entry.id,
            tokenNumber: entry.tokenNumber,
            queueId,
          })
        );

        navigate(`/queue/${queueId}/status/${entry.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to join the queue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" className="text-blue-600 mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading queue information...</p>
        </div>
      </div>
    );
  }

  if (error && !queueInfo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Queue Not Found</h2>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="secondary" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaused = queueInfo?.status === 'PAUSED';
  const isClosed = queueInfo?.status === 'CLOSED';
  const isFull = queueInfo?.isFull;
  const cannotJoin = isPaused || isClosed || isFull;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-bold text-gray-900 text-lg mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <span>Queue<span className="text-blue-600">Less</span></span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Join Virtual Queue</h2>
          <p className="text-sm text-gray-500 mt-1">Get your digital token in seconds</p>
        </div>

        {/* Business and Queue Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-md">
          <div className="flex items-start justify-between border-b border-gray-100 pb-4 mb-4">
            <div>
              <div className="text-xs uppercase font-semibold text-blue-600 tracking-wider">
                {queueInfo?.business?.name || 'Business'}
              </div>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">{queueInfo?.name}</h1>
              {queueInfo?.description && (
                <p className="text-xs text-gray-500 mt-1">{queueInfo.description}</p>
              )}
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                queueInfo?.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                  : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
              }`}
            >
              {queueInfo?.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100 text-center">
              <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Waiting Now
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {queueInfo?.waitingCount ?? 0}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100 text-center">
              <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Est. Wait
              </span>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                ~{queueInfo?.estimatedWaitTime ?? 0}m
              </div>
            </div>
          </div>
        </div>

        {/* Error / Alert */}
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {isPaused && (
          <Alert type="warning" title="Queue Currently Paused">
            The business has temporarily paused new check-ins. Please check back shortly.
          </Alert>
        )}

        {isFull && (
          <Alert type="warning" title="Queue at Max Capacity">
            This queue has reached its maximum capacity limit ({queueInfo?.maxCapacity} customers). Please wait until tokens advance.
          </Alert>
        )}

        {/* Check-in Form */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/90 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Full Name"
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              disabled={cannotJoin}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="e.g. +1 555-0123"
              disabled={cannotJoin}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              helperText="We'll notify you if SMS alerts are enabled"
            />

            <Button
              type="submit"
              disabled={cannotJoin}
              loading={submitting}
              size="lg"
              className="w-full mt-4 shadow-md shadow-blue-500/20"
            >
              Get Digital Token
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="text-[11px] text-gray-400 text-center mt-4">
            By joining, you agree to receive digital queue status updates on this device.
          </p>
        </div>
      </div>
    </div>
  );
}

