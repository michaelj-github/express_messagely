const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn } = require("../middleware/auth");

router.get('/', (req, res, next) => {
    res.send("<h1>Just checking - APP IS WORKING!!!</h1>")
  })

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
 router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password are required", 400);
    }

    if (await User.authenticate(username, password)) {
      let token = jwt.sign({ username }, SECRET_KEY);
      User.updateLoginTimestamp(username);
      return res.json({ token });
    } else {
      throw new ExpressError("Invalid username or password", 400);
    }
    
    
  } catch (e) {
    return next(e);
  }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
 router.post('/register', async (req, res, next) => {
  try {

    let {username} = await User.register(req.body);
    let token = jwt.sign({username}, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({token});


  } catch (e) {
    if (e.code === '23505') {
      return next(new ExpressError("That username is already in use. Please choose a different username or log in if you already have an account.", 400));
    }
    return next(e)
  }
});

 module.exports = router;
