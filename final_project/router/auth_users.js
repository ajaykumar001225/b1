const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bookCollection = require("./booksdb.js");
const userRouter = express.Router();

let registeredUsers = [];

const doesUserExist = (username) => registeredUsers.some(user => user.username === username);

const verifyUserCredentials = (username, password) => {
    const user = registeredUsers.find(user => user.username === username);
    return user && bcrypt.compareSync(password, user.password);
}

userRouter.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required." });
    }

    if (doesUserExist(username)) {
        return res.status(400).json({ message: "User already registered." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    registeredUsers.push({ username, password: hashedPassword });
    return res.status(201).json({ message: "Registration successful." });
});

userRouter.post("/signin", (req, res) => {
    const { username, password } = req.body;

    if (!verifyUserCredentials(username, password)) {
        return res.status(403).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ data: username }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });
    res.cookie('accessToken', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'Strict'
    });
    req.session.username = username; 
    return res.status(200).json({ message: "Login successful." });
});

const authenticateUser = (req, res, next) => {
    const token = req.cookies.accessToken || req.session.authorization?.token;

    if (!token) {
        return res.status(403).json({ message: "Unauthorized access." });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        req.session.username = decoded.data; 
        req.user = decoded.data; // Optionally attach user data
        next();
    });
};

userRouter.put("/auth/review/:isbn", authenticateUser, (req, res) => {
    const username = req.session.username;
    const ISBN = req.params.isbn;
    const review = req.body.review;

    if (!bookCollection[ISBN]) {
        return res.status(404).json({ message: "Book not found." });
    }

    bookCollection[ISBN].reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully." });
});

userRouter.delete("/auth/review/:isbn", authenticateUser, (req, res) => {
    const username = req.session.username;
    const ISBN = req.params.isbn;

    if (!bookCollection[ISBN]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (bookCollection[ISBN].reviews[username]) {
        delete bookCollection[ISBN].reviews[username];
        return res.status(200).json({ message: "Review removed successfully." });
    }

    return res.status(404).json({ message: "Review not found." });
});

module.exports.userRouter = userRouter;
module.exports.doesUserExist = doesUserExist;
module.exports.registeredUsers = registeredUsers;
