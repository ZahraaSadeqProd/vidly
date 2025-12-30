const express = require("express");
const router = express.Router();
const movieModule = require("../models/movie");
const { Genre } = require("../models/genre");
const { Movie, validateMovie } = movieModule;
const auth = require('../middleware/auth');

// Get all movies
router.get("/", async (req, res) => {
  const allMovies = await Movie.find().sort("title");
  res.send(allMovies);
});

// Add a new movie
router.post("/", auth, async (req, res) => {
  // Validate the request body
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  // add new movie
  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });
  await movie.save();
  res.send(movie);
});

// Update movie
router.put("/:id", auth, async (req, res) => {
  // Validate the request body
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  // find the movie
  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    },
    { new: true }
  );

  if (!movie) return res.status(404).send("Movie not found");
  // update movie
  movie.title = req.body.title;

  res.send(movie);
});

// delete movie
router.delete("/:id", auth, async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);

  // find the movie
  if (!movie) return res.status(404).send("Movie not found");

  res.send(movie);
});

// get single movie
router.get("/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  // find the movie
  if (!movie) return res.status(404).send("Movie not found");

  res.send(movie);
});

module.exports = router;
