const express = require('express');
const jwt = require('jsonwebtoken');
const bookCollection = require("./bookCollection.js");
const userRouter = express.Router();

let registeredUsers = [];

const doesUserExist = (username) => registeredUsers.some(user => user.username === username);

const verifyUserCredentials = (username, password) => {
    return registeredUsers.some(user => user.username === username && user.password === password);
}

userRouter.post("/signup", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required." });
    }

    if (doesUserExist(username)) {
        return res.status(400).json({ message: "User already registered." });
    }

    registeredUsers.push({ username, password });
    return res.status(201).json({ message: "Registration successful." });
});

userRouter.post("/signin", (req, res) => {
    const { username, password } = req.body;

    if (!verifyUserCredentials(username, password)) {
        return res.status(403).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ data: username }, process.env.JWT_SECRET || 'secretKey', { expiresIn: '1h' });
    req.session.authorization = { token };
    req.session.username = username; // Add username to session for future use
    return res.status(200).json({ message: "Login successful.", token });
});

const authenticateUser = (req, res, next) => {
    const token = req.session.authorization?.token;

    if (!token) {
        return res.status(403).json({ message: "Unauthorized access." });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token." });
        }
        req.session.username = decoded.data; // Attach the username to the session
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
