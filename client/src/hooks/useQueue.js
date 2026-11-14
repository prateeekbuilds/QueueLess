import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import queueService from '../services/queue.service';

export default function useQueue(queueId) {
  const { socket, isConnected } = useSocket();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    if (!queueId) return;
    try {
      setError(null);
      const res = await queueService.getQueueStatus(queueId);
      const data = res?.data || res;
      setQueueData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [queueId]);

  // Initial fetch
  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Socket room management and real-time listeners
  useEffect(() => {
    if (!socket || !queueId) return;

    socket.emit('join-queue-room', queueId);

    const handleQueueUpdated = () => {
      fetchQueue();
    };

    const handleEntryUpdated = () => {
      fetchQueue();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('entry:updated', handleEntryUpdated);

    return () => {
      socket.emit('leave-queue-room', queueId);
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('entry:updated', handleEntryUpdated);
    };
  }, [socket, queueId, fetchQueue]);

  return {
    queueData,
    loading,
    error,
    refetch: fetchQueue,
  };
}
