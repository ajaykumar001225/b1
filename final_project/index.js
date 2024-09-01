const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerAuthRoutes = require('./router/userAuth.js').authenticated; 
const publicRoutes = require('./router/publicRoutes.js').general; 

const app = express();

app.use(express.json());

// Session management setup for customer-related routes
app.use("/customer", session({
    secret: "customer_fingerprint", 
    resave: true,
    saveUninitialized: true
}));

// Middleware to authenticate protected customer routes
app.use("/customer/auth/*", (req, res, next) => {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Extracting access token
        jwt.verify(token, "access", (err, user) => {
            if (err) {
                return res.status(403).json({ message: "User not authenticated" });
            }
            req.user = user;
            next();
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

// Registering route handlers
app.use("/customer", customerAuthRoutes); // Routes for authenticated customer actions
app.use("/", publicRoutes); // Publicly accessible routes

// Starting the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
