const db = require('../config/database');
const asyncHandler = require('express-async-handler');



// @desc    Get organizations for dropdown/select
// @route   GET /api/organizations/select
exports.getOrganizationsForSelect = asyncHandler(async (req, res) => {
  const [organizations] = await db.query(
    'SELECT org_id, org_name FROM organizations ORDER BY org_name'
  );

  res.json({
    success: true,
    organizations
  });
});

// @desc    Get organization details
// @route   GET /api/organizations/:id
exports.getOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const [orgs] = await db.query(
    'SELECT * FROM organizations WHERE org_id = ?',
    [id]
  );
  
  if (orgs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }
  
  res.json({
    success: true,
    data: orgs[0]
  });
});

const bcrypt = require('bcryptjs');

// @desc    Create a new organization (Super Admin Only)
// @route   POST /api/organizations
exports.createOrganization = asyncHandler(async (req, res) => {
  // Only super_admin can create organizations
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admin can create organizations'
    });
  }

  const {
    org_name,
    gst_number,
    gst_type,
    gst_percentage,
    address,
    contact_person_name,
    primary_phone,
    secondary_phone
  } = req.body;

  // Validation
  if (!org_name || !contact_person_name || !primary_phone) {
    return res.status(400).json({
      success: false,
      message: 'Organization name, contact person name, and primary phone are required'
    });
  }

  // Check if organization with same GST number already exists (if provided)
  if (gst_number) {
    const [existingOrg] = await db.query('SELECT org_id FROM organizations WHERE gst_number = ?', [gst_number]);
    if (existingOrg.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Organization with this GST number already exists'
      });
    }
  }

  // Handle organization logo
  let org_logo = null;
  if (req.file) {
    org_logo = req.file.path;
  }

  // Insert organization
  const [result] = await db.query(
    `INSERT INTO organizations (
      org_name, org_logo, gst_number, gst_type, gst_percentage,
      address, contact_person_name, primary_phone, secondary_phone,
      added_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      org_name,
      org_logo,
      gst_number || null,
      gst_type || 'NONE',
      parseFloat(gst_percentage) || 0.00,
      address || null,
      contact_person_name,
      primary_phone,
      secondary_phone || null,
      req.user.id
    ]
  );

  // Get the created organization
  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: 'Organization created successfully',
    organization: organizations[0]
  });
});

// @desc    Get all organizations (Super Admin sees all, Admin sees only their org)
// @route   GET /api/organizations
exports.getAllOrganizations = asyncHandler(async (req, res) => {
  let query = '';
  let params = [];

  if (req.user.role === 'super_admin') {
    // Super admin can see all organizations
    query = `
      SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name,
            COUNT(u.user_id) as total_users
      FROM organizations o
      LEFT JOIN users u1 ON o.added_by = u1.user_id
      LEFT JOIN users u2 ON o.updated_by = u2.user_id
      LEFT JOIN users u ON o.org_id = u.org_id
      GROUP BY o.org_id
      ORDER BY o.created_at DESC
    `;
  } else if (req.user.role === 'admin') {
    // Admin can only see their own organization
    query = `
      SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name,
            COUNT(u.user_id) as total_users
      FROM organizations o
      LEFT JOIN users u1 ON o.added_by = u1.user_id
      LEFT JOIN users u2 ON o.updated_by = u2.user_id
      LEFT JOIN users u ON o.org_id = u.org_id
      WHERE o.org_id = ?
      GROUP BY o.org_id
      ORDER BY o.created_at DESC
    `;
    params = [req.user.org_id];
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const [organizations] = await db.query(query, params);

  res.json({
    success: true,
    count: organizations.length,
    organizations
  });
});

// @desc    Get single organization by ID with role-based access
// @route   GET /api/organizations/:id
exports.getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if user has access to this organization
  if (req.user.role === 'admin' && req.user.org_id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to this organization'
    });
  }

  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [id]
  );

  if (organizations.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  // Get users belonging to this organization
  const [users] = await db.query(
    `SELECT user_id, full_name, email, phone, role, status, profile_image, base_salary
     FROM users
     WHERE org_id = ?`,
    [id]
  );

  res.json({
    success: true,
    organization: organizations[0],
    users: users
  });
});

// @desc    Update organization with role-based access
// @route   PUT /api/organizations/:id
exports.updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check access
  if (req.user.role === 'admin' && req.user.org_id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to update this organization'
    });
  }

  // For admin, restrict what they can update
  let updateFields = {};
  if (req.user.role === 'super_admin') {
    updateFields = req.body;
  } else if (req.user.role === 'admin') {
    // Admin can only update basic info, not GST or critical details
    const allowedFields = ['org_name', 'address', 'contact_person_name', 'primary_phone', 'secondary_phone'];
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields[key] = req.body[key];
      }
    });
  }

  // Check if organization exists
  const [existingOrgs] = await db.query('SELECT * FROM organizations WHERE org_id = ?', [id]);
  if (existingOrgs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  // Check for duplicate GST number (only for super_admin)
  if (updateFields.gst_number && updateFields.gst_number !== existingOrgs[0].gst_number && req.user.role === 'super_admin') {
    const [duplicateOrgs] = await db.query(
      'SELECT org_id FROM organizations WHERE gst_number = ? AND org_id != ?',
      [updateFields.gst_number, id]
    );
    if (duplicateOrgs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Another organization with this GST number already exists'
      });
    }
  }

  // Handle organization logo
  let org_logo = existingOrgs[0].org_logo;
  if (req.file) {
    org_logo = req.file.path;
  }

  // Build update query dynamically
  const updateValues = [];
  let updateQuery = 'UPDATE organizations SET ';
  
  // Add logo if uploaded
  if (req.file) {
    updateQuery += 'org_logo = ?, ';
    updateValues.push(org_logo);
  }

  // Add other fields
  Object.keys(updateFields).forEach((key, index) => {
    updateQuery += `${key} = ?, `;
    updateValues.push(updateFields[key]);
  });

  // Add updated_by and updated_at
  updateQuery += 'updated_by = ?, updated_at = NOW() WHERE org_id = ?';
  updateValues.push(req.user.id, id);

  await db.query(updateQuery, updateValues);

  // Get updated organization
  const [organizations] = await db.query(
    `SELECT o.*, 
            u1.full_name as added_by_name,
            u2.full_name as updated_by_name
     FROM organizations o
     LEFT JOIN users u1 ON o.added_by = u1.user_id
     LEFT JOIN users u2 ON o.updated_by = u2.user_id
     WHERE o.org_id = ?`,
    [id]
  );

  res.json({
    success: true,
    message: 'Organization updated successfully',
    organization: organizations[0]
  });
});

// @desc    Delete organization (Super Admin Only)
// @route   DELETE /api/organizations/:id
exports.deleteOrganization = asyncHandler(async (req, res) => {
  // Only super_admin can delete organizations
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only super admin can delete organizations'
    });
  }

  const { id } = req.params;

  // Check if organization has users
  const [users] = await db.query('SELECT COUNT(*) as user_count FROM users WHERE org_id = ?', [id]);
  
  if (users[0].user_count > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete organization with associated users. Please reassign or delete users first.'
    });
  }

  const [result] = await db.query('DELETE FROM organizations WHERE org_id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  res.json({
    success: true,
    message: 'Organization deleted successfully'
  });
});

// @desc    Register new user with role-based access
// @route   POST /api/organizations/:id/users
exports.addUserToOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    full_name,
    email,
    phone,
    role,
    base_salary,
    date_of_birth,
    gender
  } = req.body;

  // Check access
  if (req.user.role === 'admin' && req.user.org_id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to add users to this organization'
    });
  }

  // Validation
  if (!full_name || !email || !phone || !role) {
    return res.status(400).json({
      success: false,
      message: 'Full name, email, phone, and role are required'
    });
  }

  // Check role hierarchy
  if (req.user.role === 'admin') {
    // Admin can only add: employee, manager, admin (no salary for admin)
    const allowedRoles = ['employee', 'manager', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin can only add employee, manager, or admin roles'
      });
    }

    // If adding admin, base_salary should be null
    if (role === 'admin' && base_salary) {
      return res.status(400).json({
        success: false,
        message: 'Admin role should not have base salary'
      });
    }
  }

  // Check if user with same email exists
  const [existingUsers] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Check if organization exists
  const [orgs] = await db.query('SELECT org_id FROM organizations WHERE org_id = ?', [id]);
  if (orgs.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Organization not found'
    });
  }

  // Generate default password (name@12345)
  const defaultPassword = `${full_name.split(' ')[0].toLowerCase()}@12345`;
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Insert user
  const [result] = await db.query(
    `INSERT INTO users (
      full_name, email, phone, password_hash, role, 
      base_salary, org_id, date_of_birth, gender,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
    [
      full_name,
      email,
      phone,
      hashedPassword,
      role,
      role === 'admin' ? null : (parseFloat(base_salary) || 0), 
      id,
      date_of_birth || null,
      gender || null,
      'active',
      
    ]
  );

  // Get created user
  const [users] = await db.query(
    `SELECT user_id, full_name, email, phone, role, status, profile_image, base_salary
     FROM users
     WHERE user_id = ?`,
    [result.insertId]
  );

  res.status(201).json({
    success: true,
    message: `User added successfully to organization. Default password: ${defaultPassword}`,
    user: users[0]
  });
});

// @desc    Get all users in organization with role-based access
// @route   GET /api/organizations/:id/users
exports.getOrganizationUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check access
  if (req.user.role === 'admin' && req.user.org_id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to view users of this organization'
    });
  }

  const [users] = await db.query(
    `SELECT user_id, full_name, email, phone, role, status, profile_image, base_salary, 
            date_of_birth, gender, created_at
     FROM users
     WHERE org_id = ?
     ORDER BY 
       CASE role 
         WHEN 'admin' THEN 1
         WHEN 'manager' THEN 2
         WHEN 'employee' THEN 3
         ELSE 4
       END, created_at DESC`,
    [id]
  );

  res.json({
    success: true,
    count: users.length,
    users
  });
});