var express = require('express');
var router = express.Router();

const passport = require('passport');
const jwtStrategy = require('../jwtStrategy');

passport.use(jwtStrategy);

const authRouter = require('./auth/auth');
const postsRouter = require('./posts/post');
const usersRouter = require('./users/users');

/* GET home page. */

router.use("/auth", authRouter);
router.use("/posts", postsRouter);
router.use("/users", usersRouter);

module.exports = router;
