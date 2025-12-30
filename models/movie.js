const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    genreId: Joi.ObjectId().required(),
    numberInStock: Joi.number().required(),
    dailyRentalRate: Joi.number().required()
  });

  if (!mongoose.Types.ObjectId.isValid(req.body.customerId)) {
    return res.status(400).send('Invalid Customer');
  }

  return schema.validate(movie);
}

module.exports = {
  Movie,
  validateMovie,
};
