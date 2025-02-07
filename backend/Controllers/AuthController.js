const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");

const register = async (req, res) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    // Check if the user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({ 
        message: 'User already exists, you can login', 
        success: false 
      });
    }

    // Create a new user with latitude and longitude
    const userModel = new UserModel({ 
      name, 
      email, 
      password, 
      latitude, 
      longitude 
    });

    // Hash the password before saving
    userModel.password = await bcrypt.hash(password, 10);

    // Save the user to the database
    await userModel.save();

    // Respond with success message
    res.status(201).json({
      message: "Registered successfully",
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = 'Authentication failed: email or password is incorrect';

    if (!user) {
      return res.status(403).json({ 
        message: errorMsg, 
        success: false 
      });
    }

    // Compare the provided password with the hashed password in the database
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({ 
        message: errorMsg, 
        success: false 
      });
    }

    // Generate a JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Respond with success message and token
    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email: user.email,
      name: user.name
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}, { password: 0 }); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};

module.exports = {
  register,
  login,
  getUsers,
};