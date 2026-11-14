import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Layers, ArrowRight, Building, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('BUSINESS_ADMIN');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
      });

      if (role === 'CUSTOMER') {
        navigate('/queue-history');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200/80 shadow-xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <Layers className="w-7 h-7" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900 tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Get started with QueueLess virtual queue management
          </p>
        </div>

        {errorMessage && (
          <Alert type="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Role Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am registering as:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('BUSINESS_ADMIN')}
              className={`p-3 text-left rounded-xl border flex flex-col items-start gap-1 transition-all ${
                role === 'BUSINESS_ADMIN'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Building className="w-4 h-4 text-blue-600" />
                Business Owner
              </div>
              <span className="text-[11px] text-gray-500">Manage queues & staff</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-3 text-left rounded-xl border flex flex-col items-start gap-1 transition-all ${
                role === 'CUSTOMER'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-xs">
                <Smartphone className="w-4 h-4 text-blue-600" />
                Customer
              </div>
              <span className="text-[11px] text-gray-500">Track tokens & queues</span>
            </button>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            icon={User}
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            required
            autoComplete="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            placeholder="+1 555-0123"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            helperText="Optional, for SMS notifications"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            required
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Input
            label="Confirm Password"
            type="password"
            icon={Lock}
            required
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            loading={loading}
            size="lg"
            className="w-full mt-6 shadow-md shadow-blue-500/20"
          >
            Create Account
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

