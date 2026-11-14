import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';
import { emitQueueUpdate } from '../socket/index.js';
import { calculateEstimatedWaitTime } from './waitTime.service.js';

export const createQueue = async ({ businessId, name, description, averageServiceTime = 5, maxCapacity = 100 }, userId, userRole) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  if (business.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('Only the business owner can create queues for this business');
  }

  const queue = await prisma.queue.create({
    data: {
      businessId,
      name: name.trim(),
      description: description ? description.trim() : null,
      averageServiceTime: parseInt(averageServiceTime, 10) || 5,
      maxCapacity: parseInt(maxCapacity, 10) || 100,
      status: 'ACTIVE',
      currentToken: 0,
    },
  });

  return queue;
};

export const getQueueById = async (queueId) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
          ownerId: true,
        },
      },
      entries: {
        where: {
          status: {
            in: ['WAITING', 'CALLED', 'SERVING'],
          },
        },
        orderBy: { tokenNumber: 'asc' },
      },
      _count: {
        select: {
          entries: {
            where: { status: 'WAITING' },
          },
        },
      },
    },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  const waitingCount = queue._count.entries;
  const estimatedWaitTime = calculateEstimatedWaitTime(waitingCount, queue.averageServiceTime);

  // Find currently serving or called entry
  const currentlyServing = queue.entries.find((e) => e.status === 'SERVING') || null;
  const currentlyCalled = queue.entries.find((e) => e.status === 'CALLED') || null;

  return {
    ...queue,
    waitingCount,
    estimatedWaitTime,
    currentlyServing,
    currentlyCalled,
  };
};

export const updateQueue = async (queueId, userId, userRole, data) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { business: true },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  if (queue.business.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('You do not have permission to update this queue');
  }

  const updated = await prisma.queue.update({
    where: { id: queueId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description ? data.description.trim() : null }),
      ...(data.averageServiceTime !== undefined && { averageServiceTime: parseInt(data.averageServiceTime, 10) }),
      ...(data.maxCapacity !== undefined && { maxCapacity: parseInt(data.maxCapacity, 10) }),
      ...(data.status && { status: data.status }),
    },
    include: {
      business: {
        select: { id: true, name: true },
      },
    },
  });

  emitQueueUpdate(queueId, { event: 'QUEUE_CONFIG_UPDATED', queue: updated });

  return updated;
};

export const deleteQueue = async (queueId, userId, userRole) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: { business: true },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  if (queue.business.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('You do not have permission to delete this queue');
  }

  await prisma.queue.delete({
    where: { id: queueId },
  });

  emitQueueUpdate(queueId, { event: 'QUEUE_DELETED', queueId });

  return { id: queueId, deleted: true };
};

export const pauseQueue = async (queueId, userId, userRole) => {
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
    throw AppError.forbidden('You are not authorized to pause this queue');
  }

  const updated = await prisma.queue.update({
    where: { id: queueId },
    data: { status: 'PAUSED' },
  });

  emitQueueUpdate(queueId, { event: 'QUEUE_PAUSED', queue: updated });

  return updated;
};

export const resumeQueue = async (queueId, userId, userRole) => {
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
    throw AppError.forbidden('You are not authorized to resume this queue');
  }

  const updated = await prisma.queue.update({
    where: { id: queueId },
    data: { status: 'ACTIVE' },
  });

  emitQueueUpdate(queueId, { event: 'QUEUE_RESUMED', queue: updated });

  return updated;
};

export const getQueuesByBusiness = async (businessId) => {
  const queues = await prisma.queue.findMany({
    where: { businessId },
    include: {
      _count: {
        select: {
          entries: {
            where: { status: 'WAITING' },
          },
        },
      },
      entries: {
        where: {
          status: { in: ['CALLED', 'SERVING'] },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return queues.map((q) => ({
    ...q,
    waitingCount: q._count.entries,
    currentlyServing: q.entries.find((e) => e.status === 'SERVING') || null,
    currentlyCalled: q.entries.find((e) => e.status === 'CALLED') || null,
  }));
};

/**
 * Public queue info for customer before joining (No auth required)
 */
export const getPublicQueueInfo = async (queueId) => {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      averageServiceTime: true,
      maxCapacity: true,
      currentToken: true,
      business: {
        select: {
          id: true,
          name: true,
          category: true,
          address: true,
        },
      },
      entries: {
        where: {
          status: { in: ['SERVING', 'CALLED'] },
        },
        select: {
          tokenNumber: true,
          status: true,
        },
      },
      _count: {
        select: {
          entries: {
            where: { status: 'WAITING' },
          },
        },
      },
    },
  });

  if (!queue) {
    throw AppError.notFound('Queue not found');
  }

  const waitingCount = queue._count.entries;
  const estimatedWaitTime = calculateEstimatedWaitTime(waitingCount, queue.averageServiceTime);
  const servingEntry = queue.entries.find((e) => e.status === 'SERVING');
  const calledEntry = queue.entries.find((e) => e.status === 'CALLED');

  return {
    id: queue.id,
    name: queue.name,
    description: queue.description,
    status: queue.status,
    averageServiceTime: queue.averageServiceTime,
    maxCapacity: queue.maxCapacity,
    business: queue.business,
    waitingCount,
    estimatedWaitTime,
    currentlyServingToken: servingEntry ? servingEntry.tokenNumber : (calledEntry ? calledEntry.tokenNumber : null),
    isFull: waitingCount >= queue.maxCapacity,
  };
};

export default {
  createQueue,
  getQueueById,
  updateQueue,
  deleteQueue,
  pauseQueue,
  resumeQueue,
  getQueuesByBusiness,
  getPublicQueueInfo,
};

