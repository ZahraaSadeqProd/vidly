const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    maxlength: 255,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // roles: [], if we wanted to manage privilges based on roles
  // operations: [deleteGenre] if we wanted to manage privilges based off operations users are allowed to do instead
});

// we made the generateAuthToken method here in the user model because according to the Information Expert Principle
// the user model is the best place to handle anything related to users including generating auth tokens
// this way we encapsulate the logic related to users within the user model
userSchema.methods.generateAuthToken = function() {
    // the first part is the payload and the second part is the private key to sign the token
    // the private key should be kept secret and not exposed in the code
    // in here we are using the config module to get the private key from the configuration file 
    // the private key is set as an environment variable 
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'));
    return token;
}

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(1024).required(),
  });

  return schema.validate(user);
}

module.exports = {
  User,
  validateUser,
  userSchema
};