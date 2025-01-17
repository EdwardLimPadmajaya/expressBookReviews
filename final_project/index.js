const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// This session middleware sets up a session for the /customer routes
app.use(
  "/customer",
  session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true })
);

// Authentication middleware for all /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not logged in" });
  }

  let token = req.session.authorization['accessToken'];
  jwt.verify(token, 'access', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
