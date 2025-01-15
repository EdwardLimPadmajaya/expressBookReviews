const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Registration endpoint
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).send("Username already exists.");
  }
  users.push({ username, password });
  res.status(201).send("User successfully registered.");
});

// Get all books
public_users.get('/', (req, res) => {
  res.send(JSON.stringify(books, null, 3));
});

// Get book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get books by author
public_users.get('/author/:author', (req, res) => {
  const author = req.params.author;
  let booksByAuthor = [];
  for (let index in books) {
    if (books.hasOwnProperty(index)) {
      if (books[index].author.toLowerCase() === author.toLowerCase()) {
        booksByAuthor.push(books[index]);
      }
    }
  }
  if (booksByAuthor.length > 0) {
    res.send(booksByAuthor);
  } else {
    res.status(404).send("No books found by that author");
  }
});

// Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title;
  let booksByTitle = [];
  for (let index in books) {
    if (books.hasOwnProperty(index)) {
      if (books[index].title.toLowerCase() === title.toLowerCase()) {
        booksByTitle.push(books[index]);
      }
    }
  }
  if (booksByTitle.length > 0) {
    res.send(booksByTitle);
  } else {
    res.status(404).send("No books found by that author");
  }
});

// Get reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    if (Object.keys(book.reviews).length > 0) {
      res.send(book.reviews);
    } else {
      res.status(404).send("No reviews found for this book");
    }
  } else {
    res.status(404).send("Book not found");
  }
});

// Task 10: Get the list of books using Axios and async/await
public_users.get('/books_async', async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send("Error retrieving books via Axios: " + error);
  }
});

// Task 11: Get book details by ISBN using Axios and async/await
public_users.get('/isbn_async/:isbn', async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(404).send("Error retrieving book by ISBN: " + error);
  }
});

// Task 12: Get book details by Author using Axios and async/await
public_users.get('/author_async/:author', async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(404).send("Error retrieving books by author: " + error);
  }
});

// Task 13: Get book details by Title using Axios and async/await
public_users.get('/title_async/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(404).send("Error retrieving books by title: " + error);
  }
});

module.exports.general = public_users;
