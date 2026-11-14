import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';
import { emitQueueUpdate, emitEntryUpdate } from '../socket/index.js';
import { calculateEstimatedWaitTime, calculateEntryPositionAndWait } from './waitTime.service.js';

/**
 * Customer Joins Queue with Atomic Token Generation
 */
export const joinQueue = async (queueId, { customerName, customerPhone, customerId = null }) => {
  // 1. Fetch queue status and capacity
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      business: { select: { id: true, name: true } },
    },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  if (queue.status !== 'ACTIVE') {
    throw AppError.badRequest(`Cannot join queue. Current queue status is ${queue.status}`);
  }

  // 2. Prevent duplicate active queue entries if user is authenticated or matching phone
  if (customerId) {
    const existingActiveEntry = await prisma.queueEntry.findFirst({
      where: {
        queueId,
        customerId,
        status: { in: ['WAITING', 'CALLED', 'SERVING'] },
      },
    });

    if (existingActiveEntry) {
      throw AppError.conflict('You already have an active token in this queue');
    }
  } else if (customerPhone) {
    const existingByPhone = await prisma.queueEntry.findFirst({
      where: {
        queueId,
        customerPhone: customerPhone.trim(),
        status: { in: ['WAITING', 'CALLED', 'SERVING'] },
      },
    });

    if (existingByPhone) {
      throw AppError.conflict('A token is already active for this phone number in this queue');
    }
  }

  // 3. Atomically check capacity and increment token inside an interactive transaction
  const result = await prisma.$transaction(async (tx) => {
    // Count current waiting entries
    const waitingCount = await tx.queueEntry.count({
      where: {
        queueId,
        status: 'WAITING',
      },
    });

    if (waitingCount >= queue.maxCapacity) {
      throw AppError.badRequest('Queue is currently at full capacity. Please try again later.');
    }

    // Atomic increment of currentToken on Queue
    const updatedQueue = await tx.queue.update({
      where: { id: queueId },
      data: {
        currentToken: {
          increment: 1,
        },
      },
      select: {
        currentToken: true,
      },
    });

    const tokenNumber = updatedQueue.currentToken;

    // Create entry with the unique token number
    const entry = await tx.queueEntry.create({
      data: {
        queueId,
        customerId: customerId || null,
        customerName: customerName ? customerName.trim() : 'Guest',
        customerPhone: customerPhone ? customerPhone.trim() : null,
        tokenNumber,
        status: 'WAITING',
      },
      include: {
        queue: {
          include: {
            business: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return { entry, tokenNumber, waitingCount };
  });

  // Calculate wait time and position
  const peopleAhead = result.waitingCount;
  const estimatedWaitMinutes = calculateEstimatedWaitTime(peopleAhead, queue.averageServiceTime);

  const responseData = {
    ...result.entry,
    peopleAhead,
    estimatedWaitMinutes,
  };

  // Broadcast real-time update to the queue room
  emitQueueUpdate(queueId, {
    event: 'CUSTOMER_JOINED',
    queueId,
    entry: {
      id: result.entry.id,
      tokenNumber: result.entry.tokenNumber,
      customerName: result.entry.customerName,
      status: result.entry.status,
    },
  });

  return responseData;
};

/**
 * Get Public/Live Status of Queue
 */
export const getQueueStatus = async (queueId) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      business: {
        select: { id: true, name: true, category: true, address: true },
      },
      entries: {
        where: {
          status: { in: ['WAITING', 'CALLED', 'SERVING'] },
        },
        orderBy: { tokenNumber: 'asc' },
        select: {
          id: true,
          tokenNumber: true,
          customerName: true,
          status: true,
          joinedAt: true,
          calledAt: true,
          servedAt: true,
        },
      },
    },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  const waitingEntries = queue.entries.filter((e) => e.status === 'WAITING');
  const calledEntries = queue.entries.filter((e) => e.status === 'CALLED');
  const servingEntries = queue.entries.filter((e) => e.status === 'SERVING');

  const currentlyServing = servingEntries[0] || calledEntries[0] || null;

  return {
    queue: {
      id: queue.id,
      name: queue.name,
      description: queue.description,
      status: queue.status,
      averageServiceTime: queue.averageServiceTime,
      maxCapacity: queue.maxCapacity,
      business: queue.business,
    },
    waitingCount: waitingEntries.length,
    estimatedWaitTime: calculateEstimatedWaitTime(waitingEntries.length, queue.averageServiceTime),
    currentlyServing,
    waitingEntries,
    calledEntries,
    servingEntries,
  };
};

/**
 * Get Single Entry Status and Position
 */
export const getEntryStatus = async (entryId) => {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
    include: {
      queue: {
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!entry) {
    throw AppError.notFound('Queue entry not found');
  }

  const { peopleAhead, estimatedWaitMinutes } = await calculateEntryPositionAndWait(
    entry.queueId,
    entry.tokenNumber,
    entry.queue.averageServiceTime
  );

  // Find currently serving token in this queue
  const activeServing = await prisma.queueEntry.findFirst({
    where: {
      queueId: entry.queueId,
      status: { in: ['SERVING', 'CALLED'] },
    },
    orderBy: { tokenNumber: 'desc' },
    select: { tokenNumber: true, status: true },
  });

  return {
    ...entry,
    peopleAhead,
    estimatedWaitMinutes,
    currentlyServingToken: activeServing ? activeServing.tokenNumber : null,
  };
};

/**
 * Customer Leaves Queue (Cancel Entry)
 */
export const leaveQueue = async (entryId, customerId = null) => {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    throw AppError.notFound('Queue entry not found');
  }

  if (entry.status !== 'WAITING' && entry.status !== 'CALLED') {
    throw AppError.badRequest(`Cannot cancel an entry that is ${entry.status}`);
  }

  // If authenticated customerId provided, ensure ownership
  if (customerId && entry.customerId && entry.customerId !== customerId) {
    throw AppError.forbidden('You can only leave queues you have joined');
  }

  const updatedEntry = await prisma.queueEntry.update({
    where: { id: entryId },
    data: { status: 'CANCELLED' },
    include: {
      queue: { select: { id: true, name: true } },
    },
  });

  // Broadcast real-time update
  emitQueueUpdate(entry.queueId, {
    event: 'CUSTOMER_LEFT',
    queueId: entry.queueId,
    entryId,
  });
  emitEntryUpdate(entry.queueId, {
    event: 'ENTRY_STATUS_CHANGED',
    entryId,
    status: 'CANCELLED',
  });

  return updatedEntry;
};

// -----------------------------------------------------------------------------
// STAFF ACTIONS
// -----------------------------------------------------------------------------

/**
 * Call Next Customer
 */
export const callNext = async (queueId, staffUserId) => {
  // Find next waiting customer
  const nextEntry = await prisma.queueEntry.findFirst({
    where: {
      queueId,
      status: 'WAITING',
    },
    orderBy: { tokenNumber: 'asc' },
  });

  if (!nextEntry) {
    throw AppError.badRequest('No customers currently waiting in this queue');
  }

  const updated = await prisma.queueEntry.update({
    where: { id: nextEntry.id },
    data: {
      status: 'CALLED',
      calledAt: new Date(),
    },
    include: {
      queue: { select: { id: true, name: true, businessId: true } },
    },
  });

  // Broadcast real-time notification
  emitQueueUpdate(queueId, {
    event: 'CUSTOMER_CALLED',
    queueId,
    entry: updated,
  });
  emitEntryUpdate(queueId, {
    event: 'ENTRY_STATUS_CHANGED',
    entryId: updated.id,
    status: 'CALLED',
    tokenNumber: updated.tokenNumber,
  });

  return updated;
};

/**
 * Skip Customer
 */
export const skipEntry = async (entryId, staffUserId) => {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) {
    throw AppError.notFound('Queue entry not found');
  }

  if (entry.status !== 'CALLED' && entry.status !== 'WAITING') {
    throw AppError.badRequest(`Cannot skip entry with status ${entry.status}. Must be WAITING or CALLED.`);
  }

  const updated = await prisma.queueEntry.update({
    where: { id: entryId },
    data: { status: 'SKIPPED' },
  });

  emitQueueUpdate(entry.queueId, {
    event: 'CUSTOMER_SKIPPED',
    queueId: entry.queueId,
    entryId: updated.id,
  });
  emitEntryUpdate(entry.queueId, {
    event: 'ENTRY_STATUS_CHANGED',
    entryId: updated.id,
    status: 'SKIPPED',
  });

  return updated;
};

/**
 * Start Service for Customer
 */
export const startService = async (entryId, staffUserId) => {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
    include: {
      queue: {
        include: {
          business: {
            include: { staff: true },
          },
        },
      },
    },
  });

  if (!entry) {
    throw AppError.notFound('Queue entry not found');
  }

  if (entry.status !== 'CALLED' && entry.status !== 'WAITING') {
    throw AppError.badRequest(`Cannot start service for entry with status ${entry.status}. Must be CALLED or WAITING.`);
  }

  // Find staff record for this staffUserId
  let staffRecord = await prisma.staff.findFirst({
    where: {
      userId: staffUserId,
      businessId: entry.queue.businessId,
    },
  });

  // If owner is serving directly without a staff record, auto-create one
  if (!staffRecord && entry.queue.business.ownerId === staffUserId) {
    staffRecord = await prisma.staff.create({
      data: {
        userId: staffUserId,
        businessId: entry.queue.businessId,
      },
    });
  }

  if (!staffRecord) {
    throw AppError.forbidden('You are not registered as staff for this business');
  }

  const now = new Date();

  // Atomically update entry and create ServiceLog
  const updated = await prisma.$transaction(async (tx) => {
    const updatedEntry = await tx.queueEntry.update({
      where: { id: entryId },
      data: {
        status: 'SERVING',
        servedAt: now,
      },
    });

    await tx.serviceLog.create({
      data: {
        queueEntryId: entryId,
        staffId: staffRecord.id,
        serviceStart: now,
      },
    });

    return updatedEntry;
  });

  emitQueueUpdate(entry.queueId, {
    event: 'SERVICE_STARTED',
    queueId: entry.queueId,
    entry: updated,
  });
  emitEntryUpdate(entry.queueId, {
    event: 'ENTRY_STATUS_CHANGED',
    entryId: updated.id,
    status: 'SERVING',
  });

  return updated;
};

/**
 * Complete Service for Customer
 */
export const completeService = async (entryId, staffUserId) => {
  const entry = await prisma.queueEntry.findUnique({
    where: { id: entryId },
    include: {
      serviceLog: true,
      queue: true,
    },
  });

  if (!entry) {
    throw AppError.notFound('Queue entry not found');
  }

  if (entry.status !== 'SERVING') {
    throw AppError.badRequest(`Cannot complete service for entry with status ${entry.status}. Must be SERVING.`);
  }

  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    const updatedEntry = await tx.queueEntry.update({
      where: { id: entryId },
      data: { status: 'SERVED' },
    });

    if (entry.serviceLog) {
      await tx.serviceLog.update({
        where: { id: entry.serviceLog.id },
        data: { serviceEnd: now },
      });
    }

    return updatedEntry;
  });

  // Dynamically recalculate average service time based on last 20 completed service logs
  try {
    const recentLogs = await prisma.serviceLog.findMany({
      where: {
        queueEntry: { queueId: entry.queueId },
        serviceEnd: { not: null },
      },
      take: 20,
      orderBy: { serviceEnd: 'desc' },
    });

    if (recentLogs.length >= 3) {
      const totalMinutes = recentLogs.reduce((acc, log) => {
        const diffMs = new Date(log.serviceEnd).getTime() - new Date(log.serviceStart).getTime();
        return acc + diffMs / (1000 * 60);
      }, 0);

      const calculatedAvg = Math.max(1, Math.round(totalMinutes / recentLogs.length));

      await prisma.queue.update({
        where: { id: entry.queueId },
        data: { averageServiceTime: calculatedAvg },
      });
    }
  } catch (err) {
    console.error('Error recalculating average service time:', err);
  }

  emitQueueUpdate(entry.queueId, {
    event: 'SERVICE_COMPLETED',
    queueId: entry.queueId,
    entry: updated,
  });
  emitEntryUpdate(entry.queueId, {
    event: 'ENTRY_STATUS_CHANGED',
    entryId: updated.id,
    status: 'SERVED',
  });

  return updated;
};

export default {
  joinQueue,
  getQueueStatus,
  getEntryStatus,
  leaveQueue,
  callNext,
  skipEntry,
  startService,
  completeService,
};

