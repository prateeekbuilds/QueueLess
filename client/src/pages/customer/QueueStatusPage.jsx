import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Building,
  RefreshCw,
  Sparkles,
  LogOut,
} from 'lucide-react';
import queueService from '../../services/queue.service';
import { useSocket } from '../../context/SocketContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

export default function QueueStatusPage() {
  const { queueId, entryId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Fetch entry status
  const fetchEntry = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        const res = await queueService.getEntryStatus(entryId);
        const data = res?.data?.entry || res?.data || res;
        setEntry(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to fetch token status.');
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [entryId]
  );

  // Initial fetch
  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  // Real-time socket listeners
  useEffect(() => {
    if (!socket || !queueId) return;

    socket.emit('join-queue-room', queueId);

    const handleUpdate = () => {
      fetchEntry();
    };

    socket.on('queue:updated', handleUpdate);
    socket.on('entry:updated', handleUpdate);

    return () => {
      socket.emit('leave-queue-room', queueId);
      socket.off('queue:updated', handleUpdate);
      socket.off('entry:updated', handleUpdate);
    };
  }, [socket, queueId, fetchEntry]);

  // Leave queue action
  const handleLeaveQueue = async () => {
    try {
      setLeaving(true);
      await queueService.leaveQueue(entryId);
      localStorage.removeItem(`queueless_entry_${queueId}`);
      setLeaveModalOpen(false);
      await fetchEntry();
    } catch (err) {
      alert(err.message || 'Failed to leave the queue');
    } finally {
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" className="text-blue-600 mb-3" />
          <p className="text-sm font-medium text-gray-600">Retrieving your live token...</p>
        </div>
      </div>
    );
  }

  if (error && !entry) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 shadow-xl text-center">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Unable to Load Token</h2>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" className="w-full" onClick={() => fetchEntry(true)}>
              Retry
            </Button>
            <Link to={`/queue/${queueId}/join`} className="w-full">
              <Button variant="primary" className="w-full">
                Join Again
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = entry?.status || 'WAITING';
  const isWaiting = status === 'WAITING';
  const isCalled = status === 'CALLED';
  const isServing = status === 'SERVING';
  const isServed = status === 'SERVED';
  const isSkipped = status === 'SKIPPED';
  const isCancelled = status === 'CANCELLED';

  const businessName = entry?.queue?.business?.name || 'Business';
  const queueName = entry?.queue?.name || 'General Queue';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Top Header Card */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Building className="w-4 h-4 text-blue-600" />
            <span className="truncate">{businessName}</span>
          </div>

          <button
            onClick={() => fetchEntry(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-gray-600 bg-white border border-gray-200 shadow-xs hover:bg-gray-50 active:scale-95 transition-all"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>

        {/* CALLED Call-to-action Notification Banner */}
        {isCalled && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-xl text-center animate-bounce duration-1000">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mb-2">
              <Bell className="w-6 h-6 text-white animate-wiggle" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">IT'S YOUR TURN!</h2>
            <p className="mt-1 text-blue-100 text-sm font-medium">
              Token <span className="font-bold underline">#{entry.tokenNumber}</span> has been called.
              Please proceed to the counter immediately.
            </p>
          </div>
        )}

        {/* SERVING Notice */}
        {isServing && (
          <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg text-center">
            <div className="inline-flex items-center gap-2 font-bold text-base">
              <Sparkles className="w-5 h-5" />
              <span>You are currently being served</span>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Please present your token #{entry.tokenNumber} to the staff.
            </p>
          </div>
        )}

        {/* SERVED Notice */}
        {isServed && (
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 text-center shadow-md">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900">Service Completed</h3>
            <p className="text-sm text-gray-500 mt-1">Thank you for visiting {businessName}!</p>
            <div className="mt-5">
              <Link to={`/queue/${queueId}/join`}>
                <Button variant="secondary" className="w-full">
                  Join Another Queue
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* SKIPPED Notice */}
        {isSkipped && (
          <div className="bg-white rounded-2xl p-6 border border-rose-200 text-center shadow-md">
            <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900">Token Was Skipped</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your token #{entry.tokenNumber} was called but skipped. Please contact counter staff or rejoin the queue.
            </p>
            <div className="mt-5">
              <Link to={`/queue/${queueId}/join`}>
                <Button variant="primary" className="w-full">
                  Rejoin Queue
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* CANCELLED Notice */}
        {isCancelled && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-md">
            <LogOut className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900">Queue Left</h3>
            <p className="text-sm text-gray-500 mt-1">You have left this queue.</p>
            <div className="mt-5">
              <Link to={`/queue/${queueId}/join`}>
                <Button variant="primary" className="w-full">
                  Join Again
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Digital Token Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xl text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <p className="text-xs uppercase font-bold tracking-widest text-gray-400 mt-1">
            {queueName}
          </p>

          {/* Large Token Badge */}
          <div className="my-6">
            <div className="inline-flex flex-col items-center justify-center w-36 h-36 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-blue-200/80 shadow-inner">
              <span className="text-xs uppercase font-semibold text-blue-600 tracking-wider">
                Your Token
              </span>
              <span className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight mt-1">
                #{entry.tokenNumber}
              </span>
            </div>
          </div>

          {/* Customer Name & Status Badge */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">{entry.customerName || 'Guest'}</p>
            <div>
              <Badge
                variant={
                  isCalled
                    ? 'primary'
                    : isServing
                    ? 'success'
                    : isWaiting
                    ? 'warning'
                    : isSkipped
                    ? 'error'
                    : 'default'
                }
                size="lg"
                dot
              >
                {status}
              </Badge>
            </div>
          </div>

          {/* Live Position Metrics (Shown while waiting or called) */}
          {(isWaiting || isCalled) && (
            <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-left">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>People Ahead</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {entry.peopleAhead ?? 0}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">in front of you</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Est. Wait</span>
                </div>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  ~{entry.estimatedWaitMinutes ?? 0}m
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">live calculation</p>
              </div>
            </div>
          )}

          {/* Currently serving banner */}
          {entry.currentlyServingToken && (
            <div className="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-medium">Currently Serving Counter:</span>
              <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                #{entry.currentlyServingToken}
              </span>
            </div>
          )}
        </div>

        {/* Action Button: Leave Queue (Only for WAITING / CALLED) */}
        {(isWaiting || isCalled) && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-rose-600 hover:bg-rose-50"
              onClick={() => setLeaveModalOpen(true)}
            >
              Leave Queue
            </Button>
          </div>
        )}
      </div>

      {/* Footer reassurance */}
      <div className="text-center text-xs text-gray-400 pt-6">
        <p>Live status connects automatically via WebSocket.</p>
        <p className="mt-0.5">Keep this tab open or bookmark this page to track your place.</p>
      </div>

      {/* Confirmation Modal for Leaving Queue */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Leave Virtual Queue?"
        subtitle="You will forfeit your token position in line."
        footer={
          <>
            <Button variant="secondary" onClick={() => setLeaveModalOpen(false)} disabled={leaving}>
              Stay in Queue
            </Button>
            <Button variant="danger" loading={leaving} onClick={handleLeaveQueue}>
              Yes, Leave Queue
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel token <strong>#{entry?.tokenNumber}</strong>? If you leave,
          you will need to take a new token at the end of the line.
        </p>
      </Modal>
    </div>
  );
}

