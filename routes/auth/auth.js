/*this is the login/sign up page of the project */
const User = require('../../models/User');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');

const bcrypt = require('bcryptjs');
const express = require('express');
require('dotenv').config();
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

//no need to authenticate with passport-jwt here, since these are auth routes
router.post('/register',
    body('email').trim().isEmail().normalizeEmail().escape(),
    body('first_name').trim().isLength({ min: 1, max: 30 }).escape(),
    body('last_name').trim().isLength({ min: 1, max: 30 }).escape(),
    body('password').trim().isLength({ min: 8, max: 64 }).escape()
    , (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            
            return res.status(400).json({ errors: errors.array() });
        }
        const reqBody = req.body;
        User.findOne({ email: reqBody.email }, (err, user) => {
            if (user) {
                console.log('doffy 2 ');
                return res.status(400).json({ message: 'email is already in use' })
            }
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(reqBody.password, salt, (err, hashedPassword) => {
                    const newUser = {
                        first_name: reqBody.first_name,
                        last_name: reqBody.last_name,
                        email: reqBody.email,
                        password: hashedPassword,
                        friends: [],
                        posts: [],
                        friendRequests: []
                    }
                    User.create(newUser, (err, user) => {
                        console.log('doffy 3 ');
                        if (err) return res.status(400).json({ message: 'error creating user' })
                        const obj = {
                            _id: user._id
                        }
                        const token = jwt.sign(obj, process.env.SECRET);

                        console.log('register is successful')
                        return res.status(200).json({
                            message: "user is successfully created",
                            token: token
                            //this token will be stored in browser and will be sent back in authorization header.
                        })
                    })
                })
            })


        })

    });


router.post('/login',
    body('email').trim().isEmail().normalizeEmail().escape(),
    body('password').trim().isLength({ min: 8, max: 64 }).escape()
    , (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            User.findOne({ email: req.body.email })
                .populate('friends')
                .exec((err, user) => {
                    if (!user) {
                        
                        return res.status(400).json({ message: "no such user exists" });
                    }
                    console.log(user);
                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (!result) {
                            return res.status(400).json({ message: 'wrong password' });
                        }
                        const obj = {
                            _id: user._id
                        }
                        console.log("login is successful");
                        const token = jwt.sign(obj, process.env.SECRET);
                        return res.status(200).json({
                            message: 'login successful',
                            token: token,
                            user: user
                        })
                    })


                })
        }
        catch (e) {
            return res.status(500).json({ message: e.message });
        }



    })

router.post('/testdrive', async (req, res, next) => {
    const oldUser = await User.findOne({ email: 'testuser@testuser.com' });
    let otherUsers = [];
    if (oldUser) {
        console.log('found old User')
        otherUsers = await User.find({ _id: { $ne: oldUser._id } });
        await Post.deleteMany({ author: oldUser._id });
        await Comment.deleteMany({ author: oldUser._id });
        await User.findByIdAndDelete(oldUser._id);

        for (user of otherUsers) {
            const updatedFriends = user.friends.filter(id => {
                id !== oldUser._id;

            })
            const updatedFriendRequests = user.friendRequests.filter(id => {
                id !== oldUser._id;
            })
            user.friends = updatedFriends;
            user.friendRequests = updatedFriendRequests;
            await user.save();
        }
    }
        console.log('cannot found old user')
        const shuffle = (userArray) => {
            const arr = [...userArray];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        otherUsers = await User.find({});
        const newUser = new User({
            first_name: "donquixote",
            last_name: "doflamingo",
            email: "testuser@testuser.com",
            password: "doffy0doffy",
            posts: [],
            friends: [],
            friendRequests: []
        })
        const shuffledUsers = shuffle(otherUsers);
        const firstSliceUsers = shuffledUsers.slice(0, 5);
        const secondSliceUsers = shuffledUsers.slice(5, 10);

        for (user of firstSliceUsers) {
            newUser.friends.push(user._id);
            user.friends.push(newUser._id);
            user.save();
        }
        for (user of secondSliceUsers) {
            newUser.friendRequests.push(user._id);
        }
        const savedUser = await newUser.save();

        const obj = {
            _id: savedUser._id
        }
        const token = jwt.sign(obj, process.env.SECRET);
        console.log("test drive log in successful");
        res.status(201).json({
            message: 'test drive log in successful',
            user: savedUser,
            token: token
        })
    
})

module.exports = router;