import prisma from '../utils/prisma.js';

/**
 * Wait Time Prediction Service Module.
 * Designed as an isolated module so that rule-based or machine-learning models
 * can be plugged in without changing the core queue domain logic.
 */

/**
 * Calculate the estimated wait time in minutes for a given number of people ahead.
 *
 * @param {number} peopleAhead - Number of customers ahead in queue
 * @param {number} averageServiceTime - Average service duration per customer in minutes
 * @returns {number} Estimated wait time in minutes (minimum 0)
 */
export const calculateEstimatedWaitTime = (peopleAhead, averageServiceTime) => {
  const safePeopleAhead = Math.max(0, parseInt(peopleAhead, 10) || 0);
  const safeAvgTime = Math.max(1, parseInt(averageServiceTime, 10) || 5);
  
  return safePeopleAhead * safeAvgTime;
};

/**
 * Compute the queue position (0-based or 1-based) and estimated wait time
 * for a specific token number in a queue.
 *
 * @param {string} queueId - Queue ID
 * @param {number} tokenNumber - Token number of the entry
 * @param {number} averageServiceTime - Average service time in minutes
 * @returns {Promise<{ peopleAhead: number, estimatedWaitMinutes: number }>}
 */
export const calculateEntryPositionAndWait = async (queueId, tokenNumber, averageServiceTime) => {
  // Count how many WAITING or CALLED entries have a lower token number
  const peopleAhead = await prisma.queueEntry.count({
    where: {
      queueId,
      status: {
        in: ['WAITING', 'CALLED'],
      },
      tokenNumber: {
        lt: tokenNumber,
      },
    },
  });

  const estimatedWaitMinutes = calculateEstimatedWaitTime(peopleAhead, averageServiceTime);

  return {
    peopleAhead,
    estimatedWaitMinutes,
  };
};

export default {
  calculateEstimatedWaitTime,
  calculateEntryPositionAndWait,
};

