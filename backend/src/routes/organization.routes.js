const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getOrganizationsForSelect,
  getOrganization,
  addUserToOrganization,
  getOrganizationUsers
} = require('../controllers/organization.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadLogo } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

// Super Admin only routes
router.post('/', authorize('super_admin'), uploadLogo.single('logo'), createOrganization);
router.delete('/:id', authorize('super_admin'), deleteOrganization);

// Routes with role-based access
router.get('/', authorize('super_admin', 'admin'), getAllOrganizations);
router.get('/:id', authorize('super_admin', 'admin'), getOrganizationById);
router.put('/:id', authorize('super_admin', 'admin'), uploadLogo.single('logo'), updateOrganization);

// User management within organization
router.post('/:id/users', authorize('super_admin', 'admin'), addUserToOrganization);
router.get('/:id/users', authorize('super_admin', 'admin'), getOrganizationUsers);

// Public select route (for dropdowns)
router.get('/select', getOrganizationsForSelect);

module.exports = router;