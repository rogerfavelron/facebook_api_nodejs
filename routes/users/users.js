var express = require("express");
var router = express.Router();
const { check, body, validationResult } = require("express-validator");
const friendsRouter = require("./friends");
const User = require('../../models/User');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const bcrypt = require('bcryptjs');
const getTokenData = require("../../utils/getTokenData");

router.use("/friends", friendsRouter);
router.use(
    passport.authenticate("jwt", { session: false })
);
router.use(getTokenData);


// GET all users
router.get("/", async (req, res, next) => {
    try {
        const users = await User.find({});
        res.status(200).json({ users: users });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
);

// POST search for user

router.post("/search", body("firstTerm").trim().escape(),
    body("secondTerm").trim().escape(),
    async (req, res, next) => {


        const { firstTerm, secondTerm } = req.body;

        const bestMatchUser = await User.findOne({
            $and: [
                { first_name: { $regex: new RegExp(firstTerm, "i") } },
                { last_name: { $regex: new RegExp(secondTerm, "i") } },
            ],
        });

        if (bestMatchUser) {
            return res
                .status(201)
                .json({ message: "User found", user: bestMatchUser });
        }

        const foundUser = await User.findOne({
            $or: [
                { first_name: { $regex: new RegExp(firstTerm, "i") } },
                { first_name: { $regex: new RegExp(secondTerm, "i") } },
                { last_name: { $regex: new RegExp(firstTerm, "i") } },
                { last_name: { $regex: new RegExp(secondTerm, "i") } },
            ],
        });

        if (foundUser) {
            return res.status(201).json({ message: "User found", user: foundUser });
        } else {
            return res
                .status(200)
                .json({ message: "User not found", error: "User not found" });
        }
    }

);

// GET specific user
router.get("/:userId", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate("friends")
            .populate("friendRequests")
            .populate("posts");
        res.status(200).json({ user: user });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
);

// PUT update user details
router.put("/:userId",
    [
        check("password").exists(),
        check("confirmPassword", "Password and confirmed password must match")
            .exists()
            .custom((value, { req }) => value === req.body.password),
    ],

    body("firstName", "First name required").trim().isLength({ min: 1 }).escape(),
    body("lastName", "Last name required").trim().isLength({ min: 1 }).escape(),
    body("email").isEmail().escape(),

    async (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;


        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.json({ errors: errors.array() });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.findById(req.payload._id);

            user.first_name = firstName;
            user.last_name = lastName;
            user.email = email;
            user.password = hashedPassword;

            const updatedUser = await user.save();
            const obj = {
                _id: user._id
            }
            const token = jwt.sign(obj, process.env.SECRET);
            return res.status(201).json({
                message: "Profile update successful",
                token: token,
                user: updatedUser,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
);

// DELETE user account

router.delete(`/:userId`, async (req, res, next) => {
    console.log(req.params.userId, req.payload._id);
    if (req.params.userId !== req.payload._id) {
        return res
            .status(401)
            .json({ message: "You may only delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.userId);
    const deletedUserPosts = await Post.deleteMany({ author: req.params.userId });
    const deletedUserComments = await Comment.deleteMany({
        user: req.params.userId,
    });
    const otherUsers = await User.find({ _id: { $ne: req.params.userId } });

    if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    for (user of otherUsers) {
        const updatedFriends = user.friends.filter(
            (id) => id !== req.params.userId
        );
        const updatedFriendRequests = user.friendRequests.filter(
            (id) => id !== req.params.userId
        );
        user.friends = updatedFriends;
        user.friendRequests = updatedFriendRequests;
        await user.save();
    }

    return res.status(200).json({ message: "User deleted" });
});

module.exports = router;