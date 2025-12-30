const winston = require('winston');

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly


  // log the exception
  console.error(err.message, err);
  res.status(500).send("Something failed.");
}