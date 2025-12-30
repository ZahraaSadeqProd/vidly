const express = require("express");
const router = express.Router();
const { Rental, validateRental } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
const auth = require('../middleware/auth');

// Get all rentals
router.get("/", async (req, res) => {
  const allRentals = await Rental.find().sort("-dateOut");
  res.send(allRentals);
});

// Add a new rental
router.post("/", auth, async (req, res) => {
  // Validate the request body
  const { error } = validateRental(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");
  
  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send("Invalid movie.");

  if (movie.numberInStock === 0)
    return res.status(400).send("Movie not in stock.");

  // add new rental
  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  // transaction using native MongoDB sessions
  const session = await mongoose.startSession();

  // transaction
  try {
    await session.withTransaction(async () => {
      await rental.save({ session });
      await Movie.updateOne(
        { _id: movie._id },
        { $inc: { numberInStock: -1 } },
        { session }
      );
    });

    res.send(rental);
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).send("Something failed.");
  } finally {
    session.endSession();
  }
});


module.exports = router;
