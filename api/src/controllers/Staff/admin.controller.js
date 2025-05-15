// admin.controller.js
const AsyncHandler = require("express-async-handler");
const Admin = require("../../models/Staff/admin.model");
const generateToken = require("../../utils/generateToken");
// const verifyToken = require("../../utils/verifyToken"); // Not directly used in this controller, but by isLogin
const { hashPassword, isPassMatched } = require("../../utils/helpers"); // hashPassword might be needed if model doesn't auto-hash on update

exports.registerAdminCtrl = AsyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    const err = new Error("Name, email, and password are required");
    err.statusCode = 400;
    throw err;
  }

  const adminFound = await Admin.findByEmail(email);
  if (adminFound) {
    const err = new Error("Admin with this email already exists");
    err.statusCode = 409; // Conflict
    throw err;
  }

  const user = new Admin(name, email, password);
  await user.save();

  const createdAdmin = await Admin.findByEmail(email); // Re-fetch to get ID and exclude password

  res.status(201).json({
    status: "success",
    data: {
      id: createdAdmin.id,
      name: createdAdmin.name,
      email: createdAdmin.email,
      role: createdAdmin.role,
    },
    message: "Admin registered successfully",
  });
});

exports.loginAdminCtrl = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new Error("Email and password are required");
    err.statusCode = 400;
    throw err;
  }

  const admin = await Admin.findByEmail(email);
  if (!admin) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  // The Admin model provides a static method for password comparison
  const isMatched = await Admin.comparePassword(password, admin.password);
  if (!isMatched) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({
    id: admin.id, // Use admin.id from the MySQL model
    role: admin.role,
    name: admin.name,
  });

  res.status(200).json({
    status: "success",
    data: {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    }, // Return token and some user info
    message: "Login successful",
  });
});

exports.getAllAdminCtrl = AsyncHandler(async (req, res) => {
  const adminsFromDb = await Admin.find(); // Admin.find() in model does SELECT *

  // Manually map to exclude sensitive data like password and ensure consistent field names (camelCase)
  const admins = adminsFromDb.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    createdAt: admin.created_at, // Assuming model returns snake_case from DB
    updatedAt: admin.updated_at, // Assuming model returns snake_case from DB
  }));

  res.status(200).json({
    status: "success",
    results: admins.length,
    data: admins,
    message: "Admins fetched successfully",
  });
});

exports.getAdminCtrl = AsyncHandler(async (req, res) => {
  const adminId = req.userAuth.id;
  const admin = await Admin.findById(adminId);

  if (!admin) {
    const err = new Error("Admin Not Found");
    err.statusCode = 404;
    throw err;
  }

  const adminData = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    // createdAt: admin.createdAt, // Add if model provides it
    // updatedAt: admin.updatedAt, // Add if model provides it
  };

  res.status(200).json({
    status: "success",
    data: adminData,
    message: "Admin Profile fetched successfully",
  });
});

exports.updateAdminCtrl = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;

  const adminExists = await Admin.findById(id);
  if (!adminExists) {
    const err = new Error("Admin not found");
    err.statusCode = 404;
    throw err;
  }

  const updateData = {};
  if (email) updateData.email = email;
  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (password) {
    // If password is being updated
    updateData.password = password; // The model's findByIdAndUpdate will handle hashing
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      // Can also throw error
      status: "fail",
      message: "No data provided for update",
    });
  }

  await Admin.findByIdAndUpdate(id, updateData);

  // Fetch the updated admin to return it (Admin.findByIdAndUpdate doesn't return the doc)
  const updatedAdmin = await Admin.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      // Return only non-sensitive, relevant fields
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
    },
    message: "Admin updated successfully",
  });
});

exports.deleteAdminCtrl = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const adminExists = await Admin.findById(id);
  if (!adminExists) {
    const err = new Error("Admin not found");
    err.statusCode = 404;
    throw err;
  }

  await Admin.findByIdAndDelete(id);
  res.status(200).json({
    // Standard success response
    status: "success",
    data: null, // Or an empty object
    message: "Admin deleted successfully",
  });
});

// Placeholder functions - converted to AsyncHandler and consistent error throwing/response
exports.suspendAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id; // Example: teacher ID to suspend
  // TODO: Implement logic for admin suspending a teacher
  // For now, placeholder:
  res.status(200).json({
    // Using 200 for a successful action, could be 201 if a new state is "created"
    status: "success",
    data: `Admin action: suspend teacher (ID: ${req.params.id}). Not fully implemented.`,
  });
});

exports.unsuspendAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id;
  // TODO: Implement logic for admin unsuspending a teacher
  res.status(200).json({
    status: "success",
    data: `Admin action: unsuspend teacher (ID: ${req.params.id}). Not fully implemented.`,
  });
});

exports.withdrawAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id;
  // TODO: Implement logic for admin withdrawing a teacher
  res.status(200).json({
    status: "success",
    data: `Admin action: withdraw teacher (ID: ${req.params.id}). Not fully implemented.`,
  });
});

exports.unwithdrawAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id;
  // TODO: Implement logic for admin unwithdrawing a teacher
  res.status(200).json({
    status: "success",
    data: `Admin action: unwithdraw teacher (ID: ${req.params.id}). Not fully implemented.`,
  });
});

exports.publishAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id; // Example: exam ID to publish
  // TODO: Implement logic for admin publishing an exam
  res.status(200).json({
    status: "success",
    data: `Admin action: publish exam (ID: ${req.params.id}). Not fully implemented.`,
  });
});

exports.unpublishAdminCtrl = AsyncHandler(async (req, res) => {
  // const { id } = req.params.id;
  // TODO: Implement logic for admin unpublishing an exam
  res.status(200).json({
    status: "success",
    data: `Admin action: unpublish exam (ID: ${req.params.id}). Not fully implemented.`,
  });
});
