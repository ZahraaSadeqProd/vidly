const express = require("express");
const router = express.Router();
const { Rental, validateRental } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
const auth = require('../middleware/auth');
const moment = require("moment");

router.post("/", auth, async (req, res) => {
  if(!req.body.customerId || !req.body.movieId) {
    return res.status(400).send("no customerId or movieId is provided");
  }

  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("rental not found");

  if (rental.dateReturned){
    return res.status(400).send("return already processed");
  }

  rental.dateReturned = new Date();
  rental.rentalFee = moment().diff(rental.dateOut, 'days') * rental.movie.dailyRentalRate;
  await rental.save();

  await Movie.updateOne({ _id: rental.movie._id }, { $inc: { numberInStock: 1 } });

  return res.status(200).send(rental);
});



// // Return a rental
// router.post("/returns", auth, async (req, res) => {
//   // Validate the request body

//   const { error } = validateRental(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   const customer = await Customer.findById(req.body.customerId);
//   if (!customer) return res.status(400).send("Invalid customer.");
  
//   const movie = await Movie.findById(req.body.movieId);
//   if (!movie) return res.status(400).send("Invalid movie.");

//   if (movie.numberInStock === 0)
//     return res.status(400).send("Movie not in stock.");

//   // add new rental
//   let rental = new Rental({
//     customer: {
//       _id: customer._id,
//       name: customer.name,
//       phone: customer.phone,
//       isGold: customer.isGold,
//     },
//     movie: {
//       _id: movie._id,
//       title: movie.title,
//       dailyRentalRate: movie.dailyRentalRate,
//     },
//   });

//   // transaction using native MongoDB sessions
//   const session = await mongoose.startSession();

//   // transaction
//   try {
//     await session.withTransaction(async () => {
//       await rental.save({ session });
//       await Movie.updateOne(
//         { _id: movie._id },
//         { $inc: { numberInStock: -1 } },
//         { session }
//       );
//     });

//     res.send(rental);
//   } catch (err) {
//     console.error("Transaction error:", err);
//     res.status(500).send("Something failed.");
//   } finally {
//     session.endSession();
//   }
// });

module.exports = router;
