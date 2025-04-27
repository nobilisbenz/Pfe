const jwt = require("jsonwebtoken");

const generateToken = (userData) => {
  return jwt.sign(userData, "anykey", { expiresIn: "5d" });
};

module.exports = generateToken;
