import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

export const createBusiness = async ({ name, category, address, ownerId }) => {
  const business = await prisma.business.create({
    data: {
      name: name.trim(),
      category: category ? category.trim() : null,
      address: address ? address.trim() : null,
      ownerId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return business;
};

export const getBusinessById = async (businessId, userId, userRole) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      queues: {
        include: {
          _count: {
            select: {
              entries: {
                where: { status: 'WAITING' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      staff: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
            },
          },
        },
      },
    },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  return business;
};

export const updateBusiness = async (businessId, userId, userRole, data) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  if (business.ownerId !== userId && userRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('You do not have permission to manage this business');
  }

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.category !== undefined && { category: data.category ? data.category.trim() : null }),
      ...(data.address !== undefined && { address: data.address ? data.address.trim() : null }),
    },
  });

  return updated;
};

export const getBusinessesByOwner = async (ownerId) => {
  const businesses = await prisma.business.findMany({
    where: { ownerId },
    include: {
      queues: {
        include: {
          _count: {
            select: {
              entries: {
                where: { status: 'WAITING' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          queues: true,
          staff: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return businesses;
};

export const addStaff = async (businessId, requesterId, requesterRole, { email }) => {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    throw AppError.notFound('Business not found');
  }

  if (business.ownerId !== requesterId && requesterRole !== 'PLATFORM_ADMIN') {
    throw AppError.forbidden('Only business owners can add staff members');
  }

  const targetEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    include: { staff: true },
  });

  if (!user) {
    throw AppError.notFound(`No user found with email ${targetEmail}. The user must register first.`);
  }

  if (user.staff && user.staff.businessId === businessId) {
    throw AppError.conflict('This user is already a staff member of this business');
  }

  // Update user role to STAFF if they are CUSTOMER
  const [staffRecord] = await prisma.$transaction([
    prisma.staff.create({
      data: {
        userId: user.id,
        businessId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        role: user.role === 'CUSTOMER' ? 'STAFF' : user.role,
      },
    }),
  ]);

  return staffRecord;
};

export const getStaff = async (businessId, userId, userRole) => {
  const staff = await prisma.staff.findMany({
    where: { businessId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return staff;
};

export default {
  createBusiness,
  getBusinessById,
  updateBusiness,
  getBusinessesByOwner,
  addStaff,
  getStaff,
};

