import { STATUS_COLORS, ENTRY_STATUSES } from './constants';

export function formatTime(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '--';
  }

  const mins = Math.round(minutes);

  if (mins < 1) {
    return '< 1 min';
  }

  if (mins < 60) {
    return `${mins} min`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (remainingMins === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMins} min`;
}

export function formatDate(dateString) {
  if (!dateString) return '--';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '--';
  }
}

export function formatDateTime(dateString) {
  if (!dateString) return '--';

  try {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--';
  }
}

export function getTimeAgo(dateString) {
  if (!dateString) return '--';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return 'just now';
    if (seconds < 60) return 'just now';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return formatDate(dateString);
  } catch {
    return '--';
  }
}

export function getStatusBadgeColor(status) {
  if (!status) return 'bg-gray-100 text-gray-700';
  const upper = status.toUpperCase();
  const colors = STATUS_COLORS[upper];

  if (!colors) {
    return 'bg-gray-100 text-gray-700';
  }

  return `${colors.bg} ${colors.text}`;
}

export default {
  formatTime,
  formatDate,
  formatDateTime,
  getTimeAgo,
  getStatusBadgeColor,
};
