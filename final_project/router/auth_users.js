const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Checks if the username already exists
const isValid = (username) => {
  let checkUsername = users.filter((user) => {
    return user.username === username;
  });
  return checkUsername.length > 0; 
}

// Checks if username and password match an existing user
const authenticatedUser = (username,password) => {
  let validUsers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      { data: password }, 
      'access', 
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken, 
      username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Please provide a review text" });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully posted or updated",
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Retrieve the reviews for that book
  const reviews = books[isbn].reviews;

  // Check if there's a review by the current user
  if (reviews[username]) {
    // Delete the review by this user
    delete reviews[username];
    return res.status(200).json({
      message: "Review deleted successfully",
      reviews: reviews
    });
  } else {
    return res.status(404).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
