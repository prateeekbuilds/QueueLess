import queueService from '../services/queue.service.js';

export const createQueue = async (req, res, next) => {
  try {
    const queue = await queueService.createQueue(req.body, req.user.id, req.user.role);
    res.status(201).json({
      success: true,
      message: 'Queue created successfully',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const getQueueById = async (req, res, next) => {
  try {
    const queue = await queueService.getQueueById(req.params.id);
    res.status(200).json({
      success: true,
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const updateQueue = async (req, res, next) => {
  try {
    const queue = await queueService.updateQueue(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Queue updated successfully',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQueue = async (req, res, next) => {
  try {
    const result = await queueService.deleteQueue(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Queue deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const pauseQueue = async (req, res, next) => {
  try {
    const queue = await queueService.pauseQueue(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Queue paused successfully',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const resumeQueue = async (req, res, next) => {
  try {
    const queue = await queueService.resumeQueue(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: 'Queue resumed successfully',
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export const getQueuesByBusiness = async (req, res, next) => {
  try {
    const queues = await queueService.getQueuesByBusiness(req.params.businessId);
    res.status(200).json({
      success: true,
      data: { queues },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicInfo = async (req, res, next) => {
  try {
    const queue = await queueService.getPublicQueueInfo(req.params.id);
    res.status(200).json({
      success: true,
      data: { queue },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createQueue,
  getQueueById,
  updateQueue,
  deleteQueue,
  pauseQueue,
  resumeQueue,
  getQueuesByBusiness,
  getPublicInfo,
};

