const AysncHandler = require("express-async-handler");
const Admin = require("../../model/staff/admin");
const generateToken = require("../../utils/generateToken");
const { hashPassword, isPassMatched } = require("../../utils/helpers");

//@desc Register admin
//@route POST /api/admins/register
//@acess  Private
exports.registerAdmCtrl = AysncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  try {
    // Check if all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email and password are required"
      });
    }
    
    // Create admin with hashed password
    const user = await Admin.create({
      name,
      email,
      phone,
      password: await hashPassword(password),
    });
    
    // Remove password from response
    const userData = { ...user };
    delete userData.password;
    
    res.status(201).json({
      status: "success",
      data: userData,
      message: "Admin registered successfully",
    });
  } catch (error) {
    // Handle specific errors
    if (error.message.includes("already exists")) {
      return res.status(409).json({
        status: "error",
        message: "Admin with this email already exists"
      });
    }
    
    // Handle other errors
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

//@desc     login admins
//@route    POST /api/v1/admins/login
//@access   Private
exports.loginAdminCtrl = AysncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Verify if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Email and password required'
    });
  }

  // Find the admin
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Verify password - using the helper function with MySQL model
  const isMatched = await isPassMatched(password, admin.password);
  if (!isMatched) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Generate token with important information
  const token = generateToken({
    id: admin.id,
    role: admin.role || 'admin',
    name: admin.name
  });

  // Send response
  res.status(200).json({
    status: 'success',
    data: token,
    message: 'Login successful'
  });
});

//@desc     Get all admins
//@route    GET /api/v1/admins
//@access   Private
exports.getAdminsCtrl = AysncHandler(async (req, res) => {
  try {
    // Fetch all admins from database
    const admins = await Admin.find();
    
    // Remove sensitive information from each admin
    const sanitizedAdmins = admins.map(admin => {
      const adminData = { ...admin };
      delete adminData.password;
      return adminData;
    });
    
    res.status(200).json({
      status: "success",
      data: sanitizedAdmins,
      message: "Admins fetched successfully"
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message
    });
  }
});

//@desc     Get single admin
//@route    GET /api/v1/admins/:id
//@access   Private
exports.getAdminProfileCtrl = AysncHandler(async (req, res) => {
  const admin = await Admin.findById(req.userAuth.id);
  if (!admin) {
    throw new Error("Admin Not Found");
  } else {
    // Create a copy of admin object without the password
    const adminData = { ...admin };
    delete adminData.password;
    
    res.status(200).json({
      status: "success",
      data: adminData,
      message: "Admin Profile fetched successfully",
    });
  }
});

//@desc    update admin
//@route    UPDATE /api/v1/admins/:id
//@access   Private
exports.updateAdminCtrl = AysncHandler(async (req, res) => {
  const { email, name, password, phone } = req.body;
  
  // Check if email exists and is not the current user's email
  if (email) {
    const emailExist = await Admin.findOne({ email });
    if (emailExist && emailExist.id !== req.userAuth.id) {
      throw new Error("This email is already taken");
    }
  }

  // Check if user is updating password
  if (password) {
    // Update with password
    const admin = await Admin.findByIdAndUpdate(
      req.userAuth.id,
      {
        email,
        password: await hashPassword(password),
        name,
        phone
      },
      {
        new: true
      }
    );
    
    // Create a copy without password for response
    const adminData = { ...admin };
    delete adminData.password;
    
    res.status(200).json({
      status: "success",
      data: adminData,
      message: "Admin updated successfully",
    });
  } else {
    // Update without password
    const admin = await Admin.findByIdAndUpdate(
      req.userAuth.id,
      {
        email,
        name,
        phone
      },
      {
        new: true
      }
    );
    res.status(200).json({
      status: "success",
      data: admin,
      message: "Admin updated successfully",
    });
  }
});

//@desc     Delete admin
//@route    DELETE /api/v1/admins/:id
//@access   Private
exports.deleteAdminCtrl = AysncHandler(async (req, res) => {
  try {
    const adminId = req.params.id;
    
    // Check if admin exists
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        status: "error",
        message: "Admin not found"
      });
    }
    
    // Delete the admin
    await Admin.findByIdAndDelete(adminId);
    
    res.status(200).json({
      status: "success",
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message,
    });
  }
});

