import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Clock,
  Users,
  BarChart3,
  Bell,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
} from 'lucide-react';
import Button from '../../components/common/Button';

export default function Landing() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.100),white)] opacity-60" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-xs font-semibold text-blue-700 mb-8 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Next-Gen Virtual Queue Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Say Goodbye to Physical Lines with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Digital Queues
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Let your customers scan a QR code, receive a live digital token, and wait wherever they
            like while your team manages flow effortlessly with real-time analytics.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 shadow-lg shadow-blue-500/25">
                Start Free for Your Business
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-3.5">
                Staff & Admin Sign In
              </Button>
            </Link>
          </div>

          {/* Quick Demo Preview Banner */}
          <div className="mt-16 sm:mt-20 max-w-5xl mx-auto rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-3 sm:p-4 shadow-2xl border border-slate-800">
            <div className="rounded-xl bg-slate-900 overflow-hidden border border-slate-800 p-6 sm:p-8 text-left">
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400 font-mono ml-2">queueless.app/live-dashboard</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ● Real-time Live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase font-medium">Currently Serving</div>
                  <div className="text-4xl font-extrabold text-blue-400 mt-2">#042</div>
                  <div className="text-xs text-slate-300 mt-1">Michael Scott • Counter 1</div>
                </div>

                <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase font-medium">Waiting in Queue</div>
                  <div className="text-4xl font-extrabold text-amber-400 mt-2">7 People</div>
                  <div className="text-xs text-slate-300 mt-1">Avg. wait ~8 minutes</div>
                </div>

                <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700/60">
                  <div className="text-xs text-slate-400 uppercase font-medium">Served Today</div>
                  <div className="text-4xl font-extrabold text-emerald-400 mt-2">128</div>
                  <div className="text-xs text-slate-300 mt-1">98.4% satisfaction rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Built for Modern Businesses</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Everything you need to eliminate waiting chaos
            </p>
            <p className="mt-4 text-gray-600">
              From busy clinics and banks to restaurants and DMV offices, QueueLess turns crowded lobbies into seamless digital workflows.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Instant QR Code Onboarding</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Print branded QR posters. Customers scan with their standard phone camera—zero app downloads required.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Live Socket.io Updates</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Tokens, queue positions, and estimated wait times refresh instantly across staff dashboards and customer screens.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Actionable Analytics</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Monitor peak hours, average service times, abandonment rates, and staff velocity to continuously optimize operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">The 4-Step Flow</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Simple for customers, powerful for staff
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base mb-4">
                1
              </div>
              <h4 className="font-semibold text-gray-900">Scan QR Code</h4>
              <p className="mt-2 text-sm text-gray-600">Customer scans the displayed QR code upon arrival or from your website.</p>
            </div>

            <div className="relative p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base mb-4">
                2
              </div>
              <h4 className="font-semibold text-gray-900">Receive Digital Token</h4>
              <p className="mt-2 text-sm text-gray-600">Customer enters their name/phone and receives an instant sequential digital token.</p>
            </div>

            <div className="relative p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base mb-4">
                3
              </div>
              <h4 className="font-semibold text-gray-900">Wait Freely</h4>
              <p className="mt-2 text-sm text-gray-600">The phone displays live position countdown, people ahead, and estimated wait minutes.</p>
            </div>

            <div className="relative p-6 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base mb-4">
                4
              </div>
              <h4 className="font-semibold text-gray-900">Get Called & Served</h4>
              <p className="mt-2 text-sm text-gray-600">When staff clicks "Call Next", the customer is notified with clear counter instructions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your waiting experience?
          </h2>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Set up your first virtual queue in under 2 minutes. Free to get started.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 focus:ring-white shadow-xl">
                Create Your Free Account
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

