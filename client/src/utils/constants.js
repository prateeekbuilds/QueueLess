export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  STAFF: 'STAFF',
  BUSINESS_ADMIN: 'BUSINESS_ADMIN',
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
};

export const QUEUE_STATUSES = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
};

export const ENTRY_STATUSES = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  SERVING: 'SERVING',
  SERVED: 'SERVED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED',
};

export const STATUS_COLORS = {
  WAITING: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    border: 'border-amber-300',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  CALLED: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
    border: 'border-blue-300',
    badge: 'bg-blue-50 text-blue-700 ring-blue-700/20 animate-pulse',
  },
  SERVING: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    border: 'border-emerald-300',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  SERVED: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    border: 'border-gray-300',
    badge: 'bg-gray-50 text-gray-600 ring-gray-500/10',
  },
  SKIPPED: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    dot: 'bg-rose-500',
    border: 'border-rose-300',
    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  },
  CANCELLED: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
    badge: 'bg-slate-50 text-slate-500 ring-slate-500/10',
  },
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  QUEUE_JOIN: '/queue/:queueId/join',
  QUEUE_STATUS: '/queue/:queueId/status/:entryId',
  QUEUE_HISTORY: '/queue-history',
  QUEUE_MANAGE: '/dashboard/queues/:queueId',
  QUEUE_CREATE: '/dashboard/queues/new',
  QUEUE_QR: '/dashboard/queues/:queueId/qr',
  STAFF_MANAGE: '/dashboard/staff',
  ANALYTICS: '/dashboard/analytics',
  SETTINGS: '/dashboard/settings',
};

export default {
  ROLES,
  QUEUE_STATUSES,
  ENTRY_STATUSES,
  STATUS_COLORS,
  ROUTES,
};
