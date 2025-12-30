const express = require("express");
const router = express.Router();
const genreModule = require("../models/genre");
const { Genre, validateGenre } = genreModule;
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require('mongoose');
const validateObjectId = require("../middleware/validateObjectId");

// async function createGenre(name) {
//   const genre = new Genre({
//     name: name,
//   });

//   try {
//     const result = await genre.save();
//     console.log(result);
//   } catch (ex) {
//     for (field in ex.errors) console.log(ex.errors[field].message);
//   }
// }

// createGenre("Action");
// createGenre("Adventure");
// createGenre("Comedy");

// const genres = [
//   { id: 1, name: "Action" },
//   { id: 2, name: "Adventure" },
//   { id: 3, name: "Comedy" },
// ];

// Get all genres
router.get("/", async (req, res) => {
  const genres = await Genre.find().sort('name');
  res.send(genres);
});

// Add a new genre
router.post("/", auth, async (req, res) => {
  // Validate the request body
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // add new genre
  let genre = new Genre({
    name: req.body.name,
  });
  genre = await genre.save();
  res.send(genre);
});

// Update genre
router.put("/:id", auth, async (req, res) => {
  // find the genre
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  // Validate the request body
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!genre) return res.status(404).send("Genre not found");

  // update genre
  genre.name = req.body.name;

  res.send(genre);
});

// delete genre
router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  // find the genre
  if (!genre) return res.status(404).send("Genre not found");

  res.send(genre);
});

// get single genre
router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  // find the genre
  if (!genre) return res.status(404).send("Genre not found");

  res.send(genre);
});

module.exports = router;
