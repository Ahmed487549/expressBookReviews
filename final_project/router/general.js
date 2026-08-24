const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// ======================================================
// REGISTER NEW USER
// ======================================================

public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "User already exists"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(200).json({
        message: "User successfully registered. Now you can login."
    });
});


// ======================================================
// INTERNAL BOOK DATA ENDPOINT
// ======================================================

public_users.get("/api/books", async (req, res) => {

    try {

        return res.status(200).json(books);

    } catch (error) {

        return res.status(500).json({
            message: "Error retrieving books",
            error: error.message
        });

    }

});


// ======================================================
// GET ALL BOOKS
// Using Axios + async/await
// ======================================================

public_users.get('/', async function (req, res) {

    try {

        const response = await axios.get(
            `http://localhost:5000/api/books`
        );

        return res.status(200).json(response.data);

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });

    }

});


// ======================================================
// GET BOOK BY ISBN
// Using Axios + async/await
// ======================================================

public_users.get('/isbn/:isbn', async function (req, res) {

    try {

        const isbn = req.params.isbn;

        const response = await axios.get(
            `http://localhost:5000/api/books`
        );

        const book = response.data[isbn];

        if (book) {

            return res.status(200).json(book);

        }

        return res.status(404).json({
            message: "Book not found"
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching book",
            error: error.message
        });

    }

});


// ======================================================
// GET BOOKS BY AUTHOR
// Using Axios + async/await
// ======================================================

public_users.get('/author/:author', async function (req, res) {

    try {

        const author = req.params.author;

        const response = await axios.get(
            `http://localhost:5000/api/books`
        );

        const allBooks = response.data;

        const matchingBooks = Object.values(allBooks).filter(
            book =>
                book.author.toLowerCase() === author.toLowerCase()
        );

        if (matchingBooks.length > 0) {

            return res.status(200).json(matchingBooks);

        }

        return res.status(404).json({
            message: "No books found for this author."
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });

    }

});


// ======================================================
// GET BOOKS BY TITLE
// Using Axios + async/await
// ======================================================

public_users.get('/title/:title', async function (req, res) {

    try {

        const title = req.params.title;

        const response = await axios.get(
            `http://localhost:5000/api/books`
        );

        const allBooks = response.data;

        const matchingBooks = Object.values(allBooks).filter(
            book =>
                book.title.toLowerCase() === title.toLowerCase()
        );

        if (matchingBooks.length > 0) {

            return res.status(200).json(matchingBooks);

        }

        return res.status(404).json({
            message: "No books found with this title."
        });

    } catch (error) {

        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });

    }

});


// ======================================================
// GET BOOK REVIEW
// ======================================================

public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;

    if (books[isbn]) {

        return res.status(200).json(
            books[isbn].reviews
        );

    }

    return res.status(404).json({
        message: "Book not found."
    });

});


module.exports.general = public_users;
