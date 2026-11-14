import businessService from '../services/business.service.js';

export const createBusiness = async (req, res, next) => {
  try {
    const business = await businessService.createBusiness({
      ...req.body,
      ownerId: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

export const getBusinessById = async (req, res, next) => {
  try {
    const business = await businessService.getBusinessById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const business = await businessService.updateBusiness(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(200).json({
      success: true,
      message: 'Business updated successfully',
      data: { business },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBusinesses = async (req, res, next) => {
  try {
    const businesses = await businessService.getBusinessesByOwner(req.user.id);
    res.status(200).json({
      success: true,
      data: { businesses },
    });
  } catch (error) {
    next(error);
  }
};

export const addStaff = async (req, res, next) => {
  try {
    const staff = await businessService.addStaff(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const staff = await businessService.getStaff(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { staff },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createBusiness,
  getBusinessById,
  updateBusiness,
  getMyBusinesses,
  addStaff,
  getStaff,
};

