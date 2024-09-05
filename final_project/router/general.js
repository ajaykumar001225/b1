const express = require('express');
const bookCollection = require("./booksdb.js");
const { doesUserExist, registeredUsers } = require("./auth_users.js");
const publicRoutes = express.Router();

publicRoutes.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (doesUserExist(username)) {
        return res.status(400).json({ message: "User already exists." });
    }

    registeredUsers.push({ username, password });
    return res.status(201).json({ message: "User created successfully." });
});

// Get the book list available in the shop using Promises
publicRoutes.get('/', (req, res) => {
    Promise.resolve(bookCollection)
        .then(books => res.json(books))
        .catch(error => res.status(500).json({ message: "Error retrieving books." }));
});

// Get book details based on ISBN using Promises
publicRoutes.get('/isbn/:isbn', (req, res) => {
    const ISBN = req.params.isbn;

    Promise.resolve(bookCollection[ISBN])
        .then(book => {
            if (book) {
                res.json(book);
            } else {
                res.status(404).json({ message: "Book not found." });
            }
        })
        .catch(error => res.status(500).json({ message: "Error retrieving book details." }));
});

// Get book details based on author using Promises
publicRoutes.get('/author/:author', (req, res) => {
    const authorName = req.params.author;
    const booksByAuthor = Object.values(bookCollection).filter(book => book.author === authorName);

    Promise.resolve(booksByAuthor)
        .then(books => {
            if (books.length > 0) {
                res.json(books);
            } else {
                res.status(404).json({ message: "No books found by this author." });
            }
        })
        .catch(error => res.status(500).json({ message: "Error retrieving books by author." }));
});

// Get all books based on title using Promises
publicRoutes.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const booksByTitle = Object.values(bookCollection).filter(book => book.title === title);

    Promise.resolve(booksByTitle)
        .then(books => {
            if (books.length > 0) {
                res.json(books);
            } else {
                res.status(404).json({ message: "No books found with this title." });
            }
        })
        .catch(error => res.status(500).json({ message: "Error retrieving books by title." }));
});

// Get book review by ISBN using Promises
publicRoutes.get('/review/:isbn', (req, res) => {
    const ISBN = req.params.isbn;
    const reviews = bookCollection[ISBN]?.reviews;

    Promise.resolve(reviews)
        .then(reviews => {
            if (reviews && Object.keys(reviews).length > 0) {
                res.json(reviews);
            } else {
                res.status(404).json({ message: "No reviews found for this book." });
            }
        })
        .catch(error => res.status(500).json({ message: "Error retrieving reviews." }));
});

module.exports.publicRoutes = publicRoutes;
