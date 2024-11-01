const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  return !!users.find((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const matchedUser = users.find((user) => user.username === username);
  return !!matchedUser && matchedUser.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );
    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!!books) {
    const isbn = req.params.isbn;
    const matchedBook = books[isbn];

    if (!!matchedBook) {
      const reviews = matchedBook.reviews;
      const username = req.session.authorization.username;
      try {
        reviews[username] = req.query.review;
        return res
          .status(200)
          .json({
            message: `The review for the book with ISBN ${isbn} has been added/updated`,
          });
      } catch (e) {
        return res
          .status(404)
          .json({ message: "Error: new review not posted" });
      }
    }
    return res.status(200).json({ message: "No book found for given ISBN" });
  }
  return res
    .status(404)
    .json({ message: "Error: unable to access books list" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (!!books) {
    const isbn = req.params.isbn;
    const matchedBook = books[isbn];

    if (!!matchedBook) {
      const reviews = matchedBook.reviews;
      const username = req.session.authorization.username;
      try {
        delete reviews[username];
        return res
          .status(200)
          .json({
            message: `The review for the book with ISBN ${isbn} has been deleted`,
          });
      } catch (e) {
        return res.status(404).json({ message: "Error: review not deleted" });
      }
    }
    return res.status(200).json({ message: "No book found for given ISBN" });
  }
  return res
    .status(404)
    .json({ message: "Error: unable to access books list" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
