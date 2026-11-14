import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

/**
 * Get start and end of "today" in local server time.
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Business-level Analytics
 */
export const getBusinessAnalytics = async (businessId, userId, userRole) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      staff: true,
      queues: { select: { id: true, name: true, status: true, averageServiceTime: true } },
    },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  const isOwner = business.ownerId === userId;
  const isStaff = business.staff.some((s) => s.userId === userId);
  if (!isOwner && !isStaff && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('You are not authorized to view analytics for this business');
  }

  const { start: todayStart, end: todayEnd } = getTodayRange();
  const queueIds = business.queues.map((q) => q.id);

  if (queueIds.length === 0) {
    return {
      businessId,
      businessName: business.name,
      totalCustomersToday: 0,
      customersWaiting: 0,
      customersServed: 0,
      averageWaitTime: 0,
      averageServiceTime: 0,
      peakHours: [],
      abandonmentRate: 0,
      queueBreakdown: [],
    };
  }

  // 1. Total customers joined today across all queues
  const entriesToday = await prisma.queueEntry.findMany({
    where: {
      queueId: { in: queueIds },
      joinedAt: { gte: todayStart, lte: todayEnd },
    },
    select: {
      id: true,
      queueId: true,
      status: true,
      joinedAt: true,
      calledAt: true,
      servedAt: true,
    },
  });

  const totalCustomersToday = entriesToday.length;

  // 2. Customers currently waiting across all queues
  const customersWaiting = await prisma.queueEntry.count({
    where: {
      queueId: { in: queueIds },
      status: 'WAITING',
    },
  });

  // 3. Customers served today
  const servedToday = entriesToday.filter((e) => e.status === 'SERVED');
  const customersServed = servedToday.length;

  // 4. Average wait time (minutes) for served/called customers today
  let totalWaitMinutes = 0;
  let waitCount = 0;
  servedToday.forEach((e) => {
    if (e.calledAt && e.joinedAt) {
      const waitMs = new Date(e.calledAt).getTime() - new Date(e.joinedAt).getTime();
      totalWaitMinutes += waitMs / (1000 * 60);
      waitCount++;
    }
  });
  const averageWaitTime = waitCount > 0 ? Math.round(totalWaitMinutes / waitCount) : 0;

  // 5. Average service time from ServiceLogs today
  const serviceLogsToday = await prisma.serviceLog.findMany({
    where: {
      queueEntry: {
        queueId: { in: queueIds },
      },
      serviceStart: { gte: todayStart, lte: todayEnd },
      serviceEnd: { not: null },
    },
  });

  let totalServiceMinutes = 0;
  serviceLogsToday.forEach((log) => {
    const durationMs = new Date(log.serviceEnd).getTime() - new Date(log.serviceStart).getTime();
    totalServiceMinutes += durationMs / (1000 * 60);
  });
  const averageServiceTime =
    serviceLogsToday.length > 0
      ? Math.round(totalServiceMinutes / serviceLogsToday.length)
      : 0;

  // 6. Peak hours breakdown (by hour of day: 0..23)
  const hourCounts = {};
  entriesToday.forEach((e) => {
    const hour = new Date(e.joinedAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const peakHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({
      hour: parseInt(hour, 10),
      formattedHour: `${parseInt(hour, 10)}:00`,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 7. Abandonment rate: (SKIPPED + CANCELLED) / total * 100
  const abandonedCount = entriesToday.filter(
    (e) => e.status === 'SKIPPED' || e.status === 'CANCELLED'
  ).length;

  const abandonmentRate =
    totalCustomersToday > 0
      ? parseFloat(((abandonedCount / totalCustomersToday) * 100).toFixed(1))
      : 0;

  // 8. Breakdown by queue
  const queueBreakdown = business.queues.map((q) => {
    const qEntries = entriesToday.filter((e) => e.queueId === q.id);
    const qServed = qEntries.filter((e) => e.status === 'SERVED').length;
    const qAbandoned = qEntries.filter((e) => e.status === 'SKIPPED' || e.status === 'CANCELLED').length;

    return {
      id: q.id,
      name: q.name,
      status: q.status,
      averageServiceTime: q.averageServiceTime,
      totalToday: qEntries.length,
      servedToday: qServed,
      abandonedToday: qAbandoned,
    };
  });

  return {
    businessId,
    businessName: business.name,
    totalCustomersToday,
    customersWaiting,
    customersServed,
    averageWaitTime,
    averageServiceTime,
    peakHours,
    abandonmentRate,
    queueBreakdown,
  };
};

/**
 * Queue-level Analytics
 */
export const getQueueAnalytics = async (queueId, userId, userRole) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      business: {
        include: { staff: true },
      },
    },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  const isOwner = queue.business.ownerId === userId;
  const isStaff = queue.business.staff.some((s) => s.userId === userId);
  if (!isOwner && !isStaff && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('You are not authorized to view analytics for this queue');
  }

  const { start: todayStart, end: todayEnd } = getTodayRange();

  const entriesToday = await prisma.queueEntry.findMany({
    where: {
      queueId,
      joinedAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const totalToday = entriesToday.length;
  const waitingCount = await prisma.queueEntry.count({
    where: { queueId, status: 'WAITING' },
  });
  const servedToday = entriesToday.filter((e) => e.status === 'SERVED');

  let totalWaitMinutes = 0;
  let waitCount = 0;
  servedToday.forEach((e) => {
    if (e.calledAt && e.joinedAt) {
      const waitMs = new Date(e.calledAt).getTime() - new Date(e.joinedAt).getTime();
      totalWaitMinutes += waitMs / (1000 * 60);
      waitCount++;
    }
  });

  const averageWaitTime = waitCount > 0 ? Math.round(totalWaitMinutes / waitCount) : 0;

  const serviceLogs = await prisma.serviceLog.findMany({
    where: {
      queueEntry: { queueId },
      serviceStart: { gte: todayStart, lte: todayEnd },
      serviceEnd: { not: null },
    },
  });

  let totalServiceMinutes = 0;
  serviceLogs.forEach((l) => {
    const diffMs = new Date(l.serviceEnd).getTime() - new Date(l.serviceStart).getTime();
    totalServiceMinutes += diffMs / (1000 * 60);
  });

  const averageServiceTime =
    serviceLogs.length > 0 ? Math.round(totalServiceMinutes / serviceLogs.length) : queue.averageServiceTime;

  const abandonedCount = entriesToday.filter((e) => e.status === 'SKIPPED' || e.status === 'CANCELLED').length;
  const abandonmentRate = totalToday > 0 ? parseFloat(((abandonedCount / totalToday) * 100).toFixed(1)) : 0;

  // Status breakdown
  const statusCounts = {};
  entriesToday.forEach((e) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
  });

  return {
    queueId,
    queueName: queue.name,
    businessId: queue.businessId,
    totalToday,
    waitingCount,
    servedCount: servedToday.length,
    averageWaitTime,
    averageServiceTime,
    abandonmentRate,
    statusCounts,
  };
};

/**
 * High-level Dashboard Summary for Business Admin
 */
export const getDashboardSummary = async (businessId, userId, userRole) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      staff: true,
      queues: true,
    },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  const { start: todayStart, end: todayEnd } = getTodayRange();
  const queueIds = business.queues.map((q) => q.id);

  const [customersToday, currentlyWaiting, activeQueuesCount] = await Promise.all([
    prisma.queueEntry.count({
      where: {
        queueId: { in: queueIds },
        joinedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.queueEntry.count({
      where: {
        queueId: { in: queueIds },
        status: 'WAITING',
      },
    }),
    prisma.queue.count({
      where: {
        businessId,
        status: 'ACTIVE',
      },
    }),
  ]);

  return {
    totalQueues: business.queues.length,
    activeQueues: activeQueuesCount,
    customersToday,
    currentlyWaiting,
  };
};

export default {
  getBusinessAnalytics,
  getQueueAnalytics,
  getDashboardSummary,
};

