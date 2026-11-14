import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Plus, ArrowLeft, Clock, Users, Building } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import businessService from '../../services/business.service';
import queueService from '../../services/queue.service';

export default function CreateQueue() {
  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [averageServiceTime, setAverageServiceTime] = useState(5);
  const [maxCapacity, setMaxCapacity] = useState(100);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await businessService.getMyBusinesses();
        const list = res?.data?.businesses || res?.businesses || [];
        setBusinesses(list);
        if (list.length > 0) {
          setBusinessId(list[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to load business profile.');
      }
    };

    fetchBusinesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Queue name is required');
      return;
    }
    if (!businessId) {
      setError('Please select or create a business profile first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await queueService.createQueue({
        businessId,
        name: name.trim(),
        description: description.trim() || undefined,
        averageServiceTime: Number(averageServiceTime) || 5,
        maxCapacity: Number(maxCapacity) || 100,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create virtual queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Create New Virtual Queue"
      subtitle="Configure a new digital waiting line for your location"
      actions={
        <Link to="/dashboard">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Back to Dashboard
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto">
        <Card>
          {error && (
            <Alert type="error" className="mb-6" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business selection */}
            {businesses.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Select Business Location
                </label>
                <select
                  value={businessId}
                  onChange={(e) => setBusinessId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2.5 px-3.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="Queue Name"
              required
              placeholder="e.g. General Consultation, Counter 1, Urgent Care Triage"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what services are offered in this queue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 px-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Average Service Time (minutes)"
                type="number"
                min="1"
                max="120"
                required
                icon={Clock}
                value={averageServiceTime}
                onChange={(e) => setAverageServiceTime(e.target.value)}
                helperText="Used to estimate initial wait times"
              />

              <Input
                label="Maximum Queue Capacity"
                type="number"
                min="5"
                max="1000"
                required
                icon={Users}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                helperText="New check-ins pause once line hits capacity"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link to="/dashboard">
                <Button variant="secondary" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={loading} icon={Plus}>
                Create Queue
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

