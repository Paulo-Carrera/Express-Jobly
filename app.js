"use strict";

/** Express app for jobly. */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);
app.use("/jobs", jobsRoutes);


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

// Error handling middleware (to be added in your app.js or server.js)
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ error: err.message });
});

app.use(async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^[Bb]earer /, "");
  if (token) {
    try {
      const decodedToken = jwt.verify(token, SECRET_KEY); // Use your secret key
      res.locals.user = await User.get(decodedToken.username); // Attach user data
    } catch (err) {
      return next(err);
    }
  }
  next();
});


module.exports = app;
