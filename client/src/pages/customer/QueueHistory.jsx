import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, History, ExternalLink, Building, ChevronRight, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export default function QueueHistory() {
  const { user } = useAuth();
  const [localTokens, setLocalTokens] = useState([]);

  useEffect(() => {
    // Collect any active queue tokens saved in localStorage
    const saved = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('queueless_entry_')) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          if (val?.id && val?.queueId) {
            saved.push(val);
          }
        } catch (e) {
          // ignore invalid items
        }
      }
    }
    setLocalTokens(saved);
  }, []);

  return (
    <div className="min-h-[calc(100vh-16rem)] max-w-4xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Queue Activity</h1>
          <p className="text-sm text-gray-500 mt-1">
            Active tokens and virtual queue receipts on this device
          </p>
        </div>
      </div>

      {localTokens.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">No active queue tokens found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            When you scan a QR code and join a virtual queue, your active token will appear here for easy tracking.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button variant="primary">Explore Platform</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Active Device Tokens
          </h2>
          {localTokens.map((item, idx) => (
            <Card key={idx} className="hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center text-blue-800 font-black text-xl">
                    <span className="text-[10px] text-blue-600 font-semibold uppercase">Token</span>
                    #{item.tokenNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Queue #{item.queueId.slice(-6)}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Entry ID: {item.id}</p>
                  </div>
                </div>

                <Link to={`/queue/${item.queueId}/status/${item.id}`}>
                  <Button variant="secondary" size="sm" icon={ExternalLink}>
                    View Live Status
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

