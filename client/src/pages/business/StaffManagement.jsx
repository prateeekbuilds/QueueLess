import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Shield, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import businessService from '../../services/business.service';
import { formatDate } from '../../utils/formatters';

export default function StaffManagement() {
  const [business, setBusiness] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add staff modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [staffEmail, setStaffEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const bizRes = await businessService.getMyBusinesses();
      const list = bizRes?.data?.businesses || bizRes?.businesses || [];

      if (list.length > 0) {
        const currentBiz = list[0];
        setBusiness(currentBiz);

        const staffRes = await businessService.getStaff(currentBiz.id);
        setStaffList(staffRes?.data?.staff || staffRes?.staff || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!staffEmail.trim()) return;

    setAdding(true);
    setError('');

    try {
      await businessService.addStaff(business.id, {
        email: staffEmail.trim(),
      });
      setSuccessMsg(`Staff member ${staffEmail} successfully assigned!`);
      setStaffEmail('');
      setModalOpen(false);
      await fetchStaff();
    } catch (err) {
      setError(err.message || 'Failed to add staff member.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <DashboardLayout
      title="Staff Management"
      subtitle={`Authorized team members for ${business?.name || 'your business'}`}
      actions={
        <Button size="sm" icon={UserPlus} onClick={() => setModalOpen(true)}>
          Add Staff Member
        </Button>
      }
    >
      <div className="space-y-6">
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

        <Card
          title="Team Members"
          subtitle="Staff can call customers, start services, and manage queue operations"
        >
          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" className="text-blue-600" />
            </div>
          ) : staffList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No staff members added"
              description="Invite staff members by email so they can operate the desk and call customers."
              action={
                <Button icon={UserPlus} onClick={() => setModalOpen(true)}>
                  Add Staff Member
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Added On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staffList.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {member.user?.name || 'Staff Member'}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{member.user?.email}</td>
                      <td className="py-4 px-4">
                        <Badge variant="primary" size="sm" dot>
                          {member.user?.role || 'STAFF'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        subtitle="The user must already have a registered QueueLess account."
      >
        <form onSubmit={handleAddStaff} className="space-y-4">
          <Input
            label="Staff User's Email"
            type="email"
            required
            icon={Mail}
            placeholder="colleague@example.com"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            helperText="They will be granted STAFF role permissions to manage desk lines."
          />

          <div className="pt-4 flex items-center justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={adding} icon={UserPlus}>
              Assign Staff Member
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

