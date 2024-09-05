const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerAuthRoutes = require('./router/auth_users.js').userRouter;
const publicRoutes = require('./router/general.js').publicRoutes;

const app = express();

app.use(express.json());

// Session management setup for customer-related routes
app.use("/customer", session({
    secret: process.env.SESSION_SECRET || "customer_fingerprint",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Ensure cookies are secure in production
}));

// Middleware to authenticate protected customer routes
app.use("/customer/auth/*", (req, res, next) => {
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken']; // Extracting access token
        jwt.verify(token, process.env.JWT_SECRET || "access", (err, user) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Starting the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
