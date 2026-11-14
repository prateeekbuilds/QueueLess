import { Server as SocketIOServer } from 'socket.io';

let io = null;

/**
 * Initialize Socket.io instance with the HTTP server.
 * @param {import('http').Server} httpServer
 * @returns {SocketIOServer}
 */
export const initializeSocket = (httpServer) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join a specific queue room
    socket.on('join-queue-room', (queueId) => {
      if (queueId) {
        const roomName = `queue:${queueId}`;
        socket.join(roomName);
        console.log(`👥 Socket ${socket.id} joined room ${roomName}`);
      }
    });

    // Leave a specific queue room
    socket.on('leave-queue-room', (queueId) => {
      if (queueId) {
        const roomName = `queue:${queueId}`;
        socket.leave(roomName);
        console.log(`👋 Socket ${socket.id} left room ${roomName}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

/**
 * Retrieve current Socket.io instance.
 * @returns {SocketIOServer|null}
 */
export const getIO = () => {
  return io;
};

/**
 * Emit an update to all sockets subscribed to `queue:{queueId}`.
 * @param {string} queueId
 * @param {object} payload
 */
export const emitQueueUpdate = (queueId, payload) => {
  if (io && queueId) {
    const roomName = `queue:${queueId}`;
    io.to(roomName).emit('queue:updated', payload);
  }
};

/**
 * Emit a targeted entry update to the queue room.
 * @param {string} queueId
 * @param {object} payload
 */
export const emitEntryUpdate = (queueId, payload) => {
  if (io && queueId) {
    const roomName = `queue:${queueId}`;
    io.to(roomName).emit('entry:updated', payload);
  }
};

export default {
  initializeSocket,
  getIO,
  emitQueueUpdate,
  emitEntryUpdate,
};

