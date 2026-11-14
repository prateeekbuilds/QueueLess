import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Clock,
  PhoneCall,
  Play,
  CheckCircle,
  SkipForward,
  Pause,
  QrCode,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import queueService from '../../services/queue.service';
import { useSocket } from '../../context/SocketContext';
import { getTimeAgo } from '../../utils/formatters';

export default function QueueManagement() {
  const { queueId } = useParams();
  const { socket, isConnected } = useSocket();

  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch full queue data with entries
  const fetchQueue = useCallback(async () => {
    try {
      setError('');
      const res = await queueService.getQueueById(queueId);
      const data = res?.data?.queue || res?.queue || res?.data || res;
      setQueueData(data);
    } catch (err) {
      setError(err.message || 'Failed to load queue details.');
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Socket.io Real-time synchronisation
  useEffect(() => {
    if (!socket || !queueId) return;

    socket.emit('join-queue-room', queueId);

    const handleRealtimeUpdate = () => {
      fetchQueue();
    };

    socket.on('queue:updated', handleRealtimeUpdate);
    socket.on('entry:updated', handleRealtimeUpdate);

    return () => {
      socket.emit('leave-queue-room', queueId);
      socket.off('queue:updated', handleRealtimeUpdate);
      socket.off('entry:updated', handleRealtimeUpdate);
    };
  }, [socket, queueId, fetchQueue]);

  // Staff Actions
  const handleCallNext = async () => {
    try {
      setActionLoading(true);
      setError('');
      await queueService.callNext(queueId);
      setSuccessMsg('Next customer called!');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to call next customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartService = async (entryId) => {
    try {
      setActionLoading(true);
      setError('');
      await queueService.startService(entryId);
      setSuccessMsg('Service started.');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to start service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async (entryId) => {
    try {
      setActionLoading(true);
      setError('');
      await queueService.completeService(entryId);
      setSuccessMsg('Service completed successfully!');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to complete service.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (entryId) => {
    try {
      setActionLoading(true);
      setError('');
      await queueService.skipEntry(entryId);
      setSuccessMsg('Customer skipped.');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to skip customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      setActionLoading(true);
      if (queueData.status === 'ACTIVE') {
        await queueService.pauseQueue(queueId);
      } else {
        await queueService.resumeQueue(queueId);
      }
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Failed to toggle queue status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Staff Desk">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-blue-600 mb-2" />
        </div>
      </DashboardLayout>
    );
  }

  const entries = queueData?.entries || [];
  const waitingEntries = entries.filter((e) => e.status === 'WAITING');
  const calledEntry = entries.find((e) => e.status === 'CALLED');
  const servingEntry = entries.find((e) => e.status === 'SERVING');

  const currentCustomer = servingEntry || calledEntry;

  return (
    <DashboardLayout
      title={queueData?.name || 'Queue Desk'}
      subtitle={`Staff service station • ${queueData?.business?.name || ''}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant={queueData?.status === 'ACTIVE' ? 'secondary' : 'success'}
            size="sm"
            onClick={handleToggleStatus}
            loading={actionLoading}
            icon={queueData?.status === 'ACTIVE' ? Pause : Play}
          >
            {queueData?.status === 'ACTIVE' ? 'Pause Queue' : 'Resume Queue'}
          </Button>

          <Link to={`/dashboard/queues/${queueId}/qr`}>
            <Button variant="secondary" size="sm" icon={QrCode}>
              View QR Poster
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Alerts */}
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert type="success" onClose={() => setSuccessMsg('')}>
            {successMsg}
          </Alert>
        )}

        {/* Current Active Customer Serving Station */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  Active Service Station
                </span>
                {currentCustomer && (
                  <Badge
                    variant={currentCustomer.status === 'SERVING' ? 'success' : 'primary'}
                    size="sm"
                    dot
                  >
                    {currentCustomer.status}
                  </Badge>
                )}
              </div>

              {currentCustomer ? (
                <div className="mt-3 flex items-baseline gap-4">
                  <span className="text-5xl font-black text-white tracking-tight">
                    #{currentCustomer.tokenNumber}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-100">
                      {currentCustomer.customerName || 'Guest Customer'}
                    </h2>
                    {currentCustomer.customerPhone && (
                      <p className="text-sm text-slate-400">{currentCustomer.customerPhone}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-2xl font-semibold text-slate-300">Counter is currently free</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Click "Call Next Customer" to notify the next waiting person.
                  </p>
                </div>
              )}
            </div>

            {/* Actions for current customer */}
            <div className="flex flex-wrap items-center gap-3">
              {currentCustomer ? (
                <>
                  {currentCustomer.status === 'CALLED' && (
                    <Button
                      variant="success"
                      size="lg"
                      icon={Play}
                      loading={actionLoading}
                      onClick={() => handleStartService(currentCustomer.id)}
                    >
                      Start Service
                    </Button>
                  )}

                  {currentCustomer.status === 'SERVING' && (
                    <Button
                      variant="primary"
                      size="lg"
                      icon={CheckCircle}
                      loading={actionLoading}
                      onClick={() => handleCompleteService(currentCustomer.id)}
                    >
                      Complete Service
                    </Button>
                  )}

                  <Button
                    variant="danger"
                    size="md"
                    icon={SkipForward}
                    loading={actionLoading}
                    onClick={() => handleSkip(currentCustomer.id)}
                  >
                    Skip Customer
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  icon={PhoneCall}
                  loading={actionLoading}
                  disabled={waitingEntries.length === 0}
                  onClick={handleCallNext}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                >
                  Call Next Customer
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Waiting Customers</span>
            <span className="text-2xl font-black text-blue-600">{waitingEntries.length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Est. Total Wait</span>
            <span className="text-2xl font-black text-amber-600">
              ~{queueData?.estimatedWaitTime ?? 0}m
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Avg. Service Time</span>
            <span className="text-2xl font-black text-gray-900">
              {queueData?.averageServiceTime} min
            </span>
          </div>
        </div>

        {/* Waiting List Table */}
        <Card
          title={`Waiting Customers (${waitingEntries.length})`}
          subtitle="Real-time ordered sequence of waiting tokens"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={PhoneCall}
              loading={actionLoading}
              disabled={waitingEntries.length === 0}
              onClick={handleCallNext}
            >
              Call Next
            </Button>
          }
        >
          {waitingEntries.length === 0 ? (
            <EmptyState
              title="No customers waiting"
              description="The waiting line is clear. Customers who scan your QR code will instantly appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Token</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Wait Duration</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {waitingEntries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        idx === 0 ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-black text-base text-gray-900">
                        #{entry.tokenNumber}
                        {idx === 0 && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Next
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-800">
                        {entry.customerName || 'Guest'}
                        {entry.customerPhone && (
                          <span className="block text-xs text-gray-400 font-normal">
                            {entry.customerPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 text-xs">
                        {getTimeAgo(entry.joinedAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="warning" size="sm" dot>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={PhoneCall}
                            loading={actionLoading}
                            onClick={handleCallNext}
                          >
                            Call
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50"
                            loading={actionLoading}
                            onClick={() => handleSkip(entry.id)}
                          >
                            Skip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

