const { pool } = require('../../config/dbConnect');
const bcrypt = require('bcryptjs');

// Admin model using direct MySQL queries
const Admin = {
  // Create a new admin
  create: async (adminData) => {
    const { name, email, phone, password, role = 'admin' } = adminData;
    
    // Check if email exists
    const existingAdmins = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    if (existingAdmins && existingAdmins.length > 0) {
      throw new Error('Admin with this email already exists');
    }
    
    // Insert new admin
    const result = await pool.query(
      'INSERT INTO admins (name, email, phone, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, email, phone, password, role]
    );
    
    // Return the created admin
    return {
      id: result.insertId,
      name,
      email,
      phone,
      role
    };
  },
  
  // Find admin by email
  findOne: async (criteria) => {
    const { email } = criteria;
    
    const admins = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
    return admins && admins.length > 0 ? admins[0] : null;
  },
  
  // Find admin by ID
  findById: async (id) => {
    const admins = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    return admins && admins.length > 0 ? admins[0] : null;
  },
  
  // Update admin by ID
  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const { email, name, password, phone } = updateData;
    
    // Build update query dynamically based on provided fields
    let updateFields = [];
    let queryParams = [];
    
    if (email) {
      updateFields.push('email = ?');
      queryParams.push(email);
    }
    
    if (name) {
      updateFields.push('name = ?');
      queryParams.push(name);
    }
    
    if (password) {
      updateFields.push('password = ?');
      queryParams.push(password);
    }
    
    if (phone) {
      updateFields.push('phone = ?');
      queryParams.push(phone);
    }
    
    // Add updatedAt timestamp
    updateFields.push('updatedAt = NOW()');
    
    // Add ID to params
    queryParams.push(id);
    
    // Execute update query
    await pool.query(
      `UPDATE admins SET ${updateFields.join(', ')} WHERE id = ?`,
      queryParams
    );
    
    // If new option is true, return updated document
    if (options.new) {
      return await Admin.findById(id);
    }
    
    return true;
  },
  
  // Get all admins
  find: async () => {
    const admins = await pool.query('SELECT * FROM admins');
    return admins;
  },
  
  // Delete admin by ID
  findByIdAndDelete: async (id) => {
    await pool.query('DELETE FROM admins WHERE id = ?', [id]);
    return true;
  },
  
  // Helper method to check if password matches
  isPasswordMatch: async function(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
};

module.exports = Admin;
