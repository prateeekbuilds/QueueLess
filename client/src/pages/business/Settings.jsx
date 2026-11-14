import React, { useState, useEffect } from 'react';
import { Building, MapPin, Tag, Check, Save } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import businessService from '../../services/business.service';

export default function Settings() {
  const [business, setBusiness] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const res = await businessService.getMyBusinesses();
        const list = res?.data?.businesses || res?.businesses || [];

        if (list.length > 0) {
          const currentBiz = list[0];
          setBusiness(currentBiz);
          setName(currentBiz.name || '');
          setCategory(currentBiz.category || '');
          setAddress(currentBiz.address || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load business profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Business name is required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      if (business) {
        // Update existing business
        await businessService.updateBusiness(business.id, {
          name: name.trim(),
          category: category.trim() || undefined,
          address: address.trim() || undefined,
        });
        setSuccessMsg('Business settings updated successfully!');
      } else {
        // Create new business
        const res = await businessService.createBusiness({
          name: name.trim(),
          category: category.trim() || undefined,
          address: address.trim() || undefined,
        });
        const created = res?.data?.business || res?.business;
        setBusiness(created);
        setSuccessMsg('Business profile created successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save business settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Business Settings">
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-blue-600 mb-2" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Business Profile & Settings"
      subtitle="Manage your business information and public queue display metadata"
    >
      <div className="max-w-2xl mx-auto space-y-6">
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

        <Card title={business ? 'Edit Business Information' : 'Register New Business'}>
          <form onSubmit={handleSave} className="space-y-5">
            <Input
              label="Business / Clinic / Store Name"
              type="text"
              required
              icon={Building}
              placeholder="e.g. Quick Care Health Center"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Industry / Category"
              type="text"
              icon={Tag}
              placeholder="e.g. Healthcare, Retail, Banking, Government"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              helperText="Helps categorize your location"
            />

            <Input
              label="Physical Address / Location"
              type="text"
              icon={MapPin}
              placeholder="e.g. 123 Main Street, Suite 200, Downtown"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              helperText="Displayed to customers on the queue page"
            />

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <Button type="submit" loading={saving} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

