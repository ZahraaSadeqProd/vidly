const auth = require('../middleware/auth');
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const userModule = require("../models/user");
const { User, validateUser } = userModule;

// Get all users
router.get("/", async (req, res) => {
  const allUsers = await User.find().sort("name");
  res.send(allUsers);
});

// Add a new user
router.post("/", async (req, res) => {
  // Validate the request body
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  // add new user
  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();

  res.header('x-auth-token', token).send(_.pick(user, ["_id", "name", "email"]));
});


// Get current logged in user
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.send(user);
});


module.exports = router;
