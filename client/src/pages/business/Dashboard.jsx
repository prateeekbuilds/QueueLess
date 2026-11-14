import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListOrdered,
  Activity,
  Users,
  Clock,
  Plus,
  Play,
  Pause,
  QrCode,
  ArrowRight,
  Building,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import businessService from '../../services/business.service';
import queueService from '../../services/queue.service';
import analyticsService from '../../services/analytics.service';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [queues, setQueues] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch businesses for the user
  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await businessService.getMyBusinesses();
        const businessList = res?.data?.businesses || res?.businesses || [];
        setBusinesses(businessList);

        if (businessList.length > 0) {
          const defaultBiz = businessList[0];
          setActiveBusiness(defaultBiz);

          // Fetch summary and queues for this business
          const [summaryRes, queuesRes] = await Promise.all([
            analyticsService.getDashboardSummary(defaultBiz.id).catch(() => null),
            queueService.getQueuesByBusiness(defaultBiz.id).catch(() => null),
          ]);

          if (summaryRes) {
            setSummary(summaryRes?.data?.summary || summaryRes?.summary);
          }
          if (queuesRes) {
            setQueues(queuesRes?.data?.queues || queuesRes?.queues || []);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load business data');
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  // Handle Pause/Resume Queue
  const handleToggleQueueStatus = async (queue) => {
    try {
      if (queue.status === 'ACTIVE') {
        await queueService.pauseQueue(queue.id);
      } else {
        await queueService.resumeQueue(queue.id);
      }

      // Refresh queues list
      const res = await queueService.getQueuesByBusiness(activeBusiness.id);
      setQueues(res?.data?.queues || res?.queues || []);
    } catch (err) {
      alert(err.message || 'Failed to update queue status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-blue-600 mb-2" />
        </div>
      </DashboardLayout>
    );
  }

  // If user has no business yet, prompt to create one
  if (businesses.length === 0) {
    return (
      <DashboardLayout title="Welcome to QueueLess">
        <div className="max-w-xl mx-auto py-12">
          <Card className="text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Set Up Your Business</h2>
            <p className="text-sm text-gray-600 mt-2">
              To begin managing virtual queues, register your business profile.
            </p>
            <div className="mt-6">
              <Link to="/dashboard/settings">
                <Button size="lg" icon={Plus}>
                  Create Business Profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`${activeBusiness?.name || 'Business'} Dashboard`}
      subtitle="Overview of your virtual lines, waiting visitors, and operations"
      actions={
        <Link to="/dashboard/queues/new">
          <Button size="sm" icon={Plus}>
            Create Queue
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        {error && <Alert type="error">{error}</Alert>}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Queues"
            value={summary?.totalQueues ?? queues.length}
            icon={ListOrdered}
            color="blue"
            subtitle="Configured lines"
          />
          <StatCard
            title="Active Queues"
            value={summary?.activeQueues ?? queues.filter((q) => q.status === 'ACTIVE').length}
            icon={Activity}
            color="emerald"
            subtitle="Accepting arrivals"
          />
          <StatCard
            title="Customers Today"
            value={summary?.customersToday ?? 0}
            icon={Users}
            color="purple"
            subtitle="Total tokens generated"
          />
          <StatCard
            title="Currently Waiting"
            value={summary?.currentlyWaiting ?? 0}
            icon={Clock}
            color="amber"
            subtitle="Live across all queues"
          />
        </div>

        {/* Queues Management Table Card */}
        <Card
          title="Virtual Queues"
          subtitle="Manage active customer flow and service stations"
          actions={
            <Link to="/dashboard/queues/new">
              <Button variant="secondary" size="sm" icon={Plus}>
                New Queue
              </Button>
            </Link>
          }
        >
          {queues.length === 0 ? (
            <EmptyState
              title="No queues created yet"
              description="Create your first queue to generate QR codes and start serving customers digitally."
              action={
                <Link to="/dashboard/queues/new">
                  <Button icon={Plus}>Create Queue</Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Queue Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Waiting</th>
                    <th className="py-3 px-4">Serving</th>
                    <th className="py-3 px-4">Avg. Service</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {queues.map((queue) => (
                    <tr key={queue.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        <Link
                          to={`/dashboard/queues/${queue.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {queue.name}
                        </Link>
                        {queue.description && (
                          <p className="text-xs text-gray-400 font-normal truncate max-w-xs mt-0.5">
                            {queue.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            queue.status === 'ACTIVE'
                              ? 'success'
                              : queue.status === 'PAUSED'
                              ? 'warning'
                              : 'default'
                          }
                          dot
                        >
                          {queue.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-gray-800">
                        {queue.waitingCount ?? 0}
                      </td>
                      <td className="py-4 px-4">
                        {queue.currentlyServing ? (
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-xs border border-emerald-200">
                            #{queue.currentlyServing.tokenNumber} ({queue.currentlyServing.customerName})
                          </span>
                        ) : queue.currentlyCalled ? (
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md text-xs border border-blue-200">
                            Called #{queue.currentlyCalled.tokenNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        ~{queue.averageServiceTime} min
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleQueueStatus(queue)}
                            title={queue.status === 'ACTIVE' ? 'Pause check-ins' : 'Resume check-ins'}
                          >
                            {queue.status === 'ACTIVE' ? (
                              <Pause className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Play className="w-4 h-4 text-emerald-600" />
                            )}
                          </Button>

                          <Link to={`/dashboard/queues/${queue.id}/qr`}>
                            <Button variant="ghost" size="sm" title="View & Print QR Code">
                              <QrCode className="w-4 h-4 text-gray-600" />
                            </Button>
                          </Link>

                          <Link to={`/dashboard/queues/${queue.id}`}>
                            <Button variant="primary" size="sm">
                              Manage Staff Desk
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
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

