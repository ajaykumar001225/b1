const express = require('express');
const bookCollection = require("./bookCollection.js");
const { doesUserExist, registeredUsers } = require("./userAuth.js");
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

// Get the book list available in the shop using async/await
publicRoutes.get('/', async (req, res) => {
    try {
        res.json(bookCollection); // Simplified the response
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books." });
    }
});

// Get book details based on ISBN using async/await
publicRoutes.get('/isbn/:isbn', async (req, res) => {
    try {
        const ISBN = req.params.isbn;
        const book = bookCollection[ISBN];

        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: "Book not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving book details." });
    }
});

// Get book details based on author using async/await
publicRoutes.get('/author/:author', async (req, res) => {
    try {
        const authorName = req.params.author;
        const booksByAuthor = Object.values(bookCollection).filter(book => book.author === authorName);

        if (booksByAuthor.length > 0) {
            res.json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found by this author." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by author." });
    }
});

// Get all books based on title using async/await
publicRoutes.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const booksByTitle = Object.values(bookCollection).filter(book => book.title === title);

        if (booksByTitle.length > 0) {
            res.json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books by title." });
    }
});

// Get book review by ISBN using async/await
publicRoutes.get('/review/:isbn', async (req, res) => {
    try {
        const ISBN = req.params.isbn;
        const reviews = bookCollection[ISBN]?.reviews;

        if (reviews && Object.keys(reviews).length > 0) {
            res.json(reviews);
        } else {
            res.status(404).json({ message: "No reviews found for this book." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reviews." });
    }
});

module.exports.publicRoutes = publicRoutes;
