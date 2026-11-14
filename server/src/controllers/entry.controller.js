import entryService from '../services/entry.service.js';

export const joinQueue = async (req, res, next) => {
  try {
    const queueId = req.params.id;
    const customerId = req.user ? req.user.id : null;

    const entry = await entryService.joinQueue(queueId, {
      ...req.body,
      customerId,
    });

    res.status(201).json({
      success: true,
      message: 'Successfully joined the queue',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const getQueueStatus = async (req, res, next) => {
  try {
    const status = await entryService.getQueueStatus(req.params.id);
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const getEntryStatus = async (req, res, next) => {
  try {
    const entry = await entryService.getEntryStatus(req.params.id);
    res.status(200).json({
      success: true,
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const leaveQueue = async (req, res, next) => {
  try {
    const customerId = req.user ? req.user.id : null;
    const entry = await entryService.leaveQueue(req.params.id, customerId);
    res.status(200).json({
      success: true,
      message: 'Successfully left the queue',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const callNext = async (req, res, next) => {
  try {
    const entry = await entryService.callNext(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Customer called',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const skipEntry = async (req, res, next) => {
  try {
    const entry = await entryService.skipEntry(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Customer skipped',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const startService = async (req, res, next) => {
  try {
    const entry = await entryService.startService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Service started',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
};

export const completeService = async (req, res, next) => {
  try {
    const entry = await entryService.completeService(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Service completed',
      data: { entry },
    });
  } catch (error) {
    next(error);
  }
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

