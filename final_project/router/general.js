const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const users = require('./auth_users.js').users;
const public_users = express.Router();

// Helper used by the search endpoints. Axios retrieves the public book list
// asynchronously, demonstrating Promise/async-await based Node.js operations.
async function getBooksWithAxios() {
  const response = await axios.get('http://localhost:5000/');
  return response.data;
}

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered. Now you can login.' });
});

// Get the book list available in the shop.
public_users.get('/', async (req, res) => {
  return res.status(200).json(books);
});

// Get book details based on ISBN.
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const allBooks = await getBooksWithAxios();
    const book = allBooks[req.params.isbn];
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get all books based on author.
public_users.get('/author/:author', async (req, res) => {
  try {
    const allBooks = await getBooksWithAxios();
    const author = decodeURIComponent(req.params.author).toLowerCase();
    const result = Object.values(allBooks).filter(book => book.author.toLowerCase() === author);
    if (!result.length) return res.status(404).json({ message: 'No books found for this author' });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get all books based on title.
public_users.get('/title/:title', async (req, res) => {
  try {
    const allBooks = await getBooksWithAxios();
    const title = decodeURIComponent(req.params.title).toLowerCase();
    const result = Object.values(allBooks).filter(book => book.title.toLowerCase().includes(title));
    if (!result.length) return res.status(404).json({ message: 'No books found for this title' });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

// Get book review.
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
