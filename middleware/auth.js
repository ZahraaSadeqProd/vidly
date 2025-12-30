const jwt = require("jsonwebtoken");
const config = require("config");

function auth(req, res, next) {
  // get the token from the request header
  const token = req.header("x-auth-token");

  // if no token, return 401 unauthorized
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  // verify the token
  try {
    // decode the token and attach the user payload to the request object
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    
    // attach the decoded payload to the req object
    req.user = decoded;

    // proceed to the next middleware or route handler
    next();
  } catch (err) {
    res.status(400).send("Invalid Token.");
  }
}

module.exports = auth;

// the purpose of this middleware is to authenticate the user by verifying the JWT token
// sent in the request header. If the token is valid, the user is allowed to proceed
// to the next middleware or route handler. If the token is missing or invalid, an
// appropriate error response is sent back to the client.