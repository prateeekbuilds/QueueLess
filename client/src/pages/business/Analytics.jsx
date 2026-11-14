import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  TrendingDown,
  Activity,
  Flame,
  Calendar,
  Layers,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import businessService from '../../services/business.service';
import analyticsService from '../../services/analytics.service';

export default function Analytics() {
  const [business, setBusiness] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const bizRes = await businessService.getMyBusinesses();
        const list = bizRes?.data?.businesses || bizRes?.businesses || [];

        if (list.length > 0) {
          const currentBiz = list[0];
          setBusiness(currentBiz);

          const analyticsRes = await analyticsService.getBusinessAnalytics(currentBiz.id);
          setAnalytics(analyticsRes?.data?.analytics || analyticsRes?.analytics || null);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Performance Analytics">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-blue-600 mb-2" />
        </div>
      </DashboardLayout>
    );
  }

  const abandonmentColor =
    (analytics?.abandonmentRate ?? 0) > 20
      ? 'rose'
      : (analytics?.abandonmentRate ?? 0) > 10
      ? 'amber'
      : 'emerald';

  return (
    <DashboardLayout
      title="Performance & Queue Analytics"
      subtitle={`Daily intelligence metrics for ${business?.name || 'your business'}`}
    >
      <div className="space-y-8">
        {error && <Alert type="error">{error}</Alert>}

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Customers Today"
            value={analytics?.totalCustomersToday ?? 0}
            icon={Users}
            color="blue"
            subtitle="All entries registered today"
          />

          <StatCard
            title="Customers Served Today"
            value={analytics?.customersServed ?? 0}
            icon={CheckCircle}
            color="emerald"
            subtitle="Completed counter services"
          />

          <StatCard
            title="Average Wait Time"
            value={`${analytics?.averageWaitTime ?? 0} min`}
            icon={Clock}
            color="amber"
            subtitle="Time between join and call"
          />

          <StatCard
            title="Average Service Time"
            value={`${analytics?.averageServiceTime ?? 0} min`}
            icon={Activity}
            color="purple"
            subtitle="Duration at counter"
          />
        </div>

        {/* Secondary Insights Row: Abandonment Rate & Peak Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Abandonment Rate Card */}
          <Card title="Queue Abandonment Rate" subtitle="Percentage of customers who skipped or cancelled">
            <div className="py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-gray-900">
                  {analytics?.abandonmentRate ?? 0}%
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    abandonmentColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700'
                      : abandonmentColor === 'amber'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {abandonmentColor === 'emerald'
                    ? 'Healthy Retention'
                    : abandonmentColor === 'amber'
                    ? 'Moderate Dropoff'
                    : 'High Dropoff Alert'}
                </span>
              </div>

              {/* Visual progress bar */}
              <div className="mt-4 w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    abandonmentColor === 'emerald'
                      ? 'bg-emerald-500'
                      : abandonmentColor === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, analytics?.abandonmentRate ?? 0)}%` }}
                />
              </div>

              <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                A low abandonment rate (&lt;10%) means customer wait time expectations align well with your service velocity.
              </p>
            </div>
          </Card>

          {/* Peak Traffic Hours Card */}
          <Card
            title="Peak Traffic Hours"
            subtitle="Busiest times of arrival based on customer check-in volume"
          >
            {analytics?.peakHours && analytics.peakHours.length > 0 ? (
              <div className="space-y-3 py-2">
                {analytics.peakHours.map((peak, idx) => (
                  <div
                    key={peak.hour}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {peak.formattedHour} - {peak.hour + 1}:00
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-gray-800">
                        {peak.count} {peak.count === 1 ? 'arrival' : 'arrivals'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">
                Not enough check-in traffic yet today to calculate peak hours.
              </div>
            )}
          </Card>
        </div>

        {/* Breakdown by Queue Table */}
        <Card
          title="Performance by Queue Line"
          subtitle="Detailed breakdown of each queue today"
        >
          {analytics?.queueBreakdown && analytics.queueBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Queue Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Total Arrivals</th>
                    <th className="py-3 px-4 text-center">Served</th>
                    <th className="py-3 px-4 text-center">Dropped / Skipped</th>
                    <th className="py-3 px-4">Avg Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.queueBreakdown.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{q.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={q.status === 'ACTIVE' ? 'success' : 'warning'}
                          size="sm"
                          dot
                        >
                          {q.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-800">
                        {q.totalToday}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                        {q.servedToday}
                      </td>
                      <td className="py-3.5 px-4 text-center text-rose-600">
                        {q.abandonedToday}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">~{q.averageServiceTime} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No queue performance data recorded today.
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

