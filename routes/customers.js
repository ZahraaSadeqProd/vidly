const express = require("express");
const router = express.Router();
const customerModule = require("../models/customer");
const { Customer, validateCustomer } = customerModule;
const auth = require('../middleware/auth');

// Get all customers
router.get("/", async (req, res) => {
  const allCustomers = await Customer.find().sort("name");
  res.send(allCustomers);
});

// Add a new customer
router.post("/", async (req, res) => {
  // Validate the request body
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // add new customer
  let customer = new Customer({
    isGold: req.body.isGold,
    name: req.body.name,
    phone: req.body.phone
  });
  customer = await customer.save();
  res.send(customer);
});

// Update customer
router.put("/:id", auth, async (req, res) => {
  // find the customer
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  // Validate the request body
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!customer) return res.status(404).send("Customer not found");

  // update customer
  customer.name = req.body.name;

  res.send(customer);
});

// delete customer
router.delete("/:id", auth, async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  // find the customer
  if (!customer) return res.status(404).send("Customer not found");

  res.send(customer);
});

// get single customer
router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  // find the customer
  if (!customer) return res.status(404).send("Customer not found");

  res.send(customer);
});


module.exports = router;
