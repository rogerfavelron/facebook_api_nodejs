const express = require('express');
const router = express.Router();

const User = require('../../models/User');

const  getTokenData = require("../../utils/getTokenData");

router.use(
  passport.authenticate("jwt", { session: false })
);
router.use(getTokenData);

router.post('/req', async (req, res, next) => {
    const { relUserId } = req.body;
    try {
        const relUser = await User.findById(relUserId);
        if (relUser._id == req.payload._id) {
            return res.status(400).json({
                message: "you cannot frient yourself"
            })
        }
        if (relUser.friends.includes(req.payload._id)) {
            return res.status(400).json({
                message: "you are already friends with this user"
            })
        }
        if (relUser.friendRequests.includes(req.payload._id)) {
            return res.status(400).json({
                message: "you already sent friend request to this user"
            })
        }
        const updatedFriendsArray = [...relUser.friendRequests, req.payload._id];
        relUser.friendRequests = updatedFriendsArray;
        const savedUser = await relUser.save();
        return res.status(201).json({ message: 'friend request sent successfully', user: updatedUser })
    }
    catch (e) {
        return res.status(500).json({
            error: e.message
        })
    }

})

//DELETE friend request (cancel)
router.delete('/cancel', async (req, res, next) => {
    const { relUserId } = req.body;
    try {
        const relUser = await User.findById(relUserId);
        if (!relUser.friendRequests.includes(req.payload._id)) {
            return res.status(404).json({ message: "friend request not found" });
        }
        const updatedRequests = relUser.friendRequests.filter(user => user != req.payload._id);
        relUser.friendRequests = updatedRequests;
        const savedUser = await relUser.save();
        return res.status(200).json({
            message: "friend request deleted",
            user: savedUser
        })



    }
    catch (e) {
        return res.status(500).json({
            error: e.message
        })
    }
})


// DELETE decline (reject) friend request

router.delete( "/decline", async (req, res, next) => {
        const { relUserId } = req.body;

        try {
            const relUser = await User.findById(req.payload._id);

            const updatedFriendReqs = relUser.friendRequests.filter(
                (item) => item._id != relUserId
            );
            relUser.friendRequests = updatedFriendReqs;
            const updatedUser = await relUser.save();

            return res
                .status(201)
                .json({ message: "Friend request declined", user: updatedUser });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
);

// DELETE remove friend
router.delete(
    "/remove",

    async (req, res, next) => {
        const { relUserId } = req.body;

        try {
            const relUser = await User.findById(relUserId);

            // delete from user's friends list
            const updatedFriends = relUser.friends.filter(
                (item) => item._id != req.payload._id
            );
            relUser.friends = updatedFriends;
            await relUser.save();

            // delete from logged in user's friends list
            const loggedInUser = await User.findById(req.payload._id);
            const loggedInUserUpdatedFriends = loggedInUser.friends.filter(
                (item) => item._id != req.payload._id
            );
            loggedInUser.friends = loggedInUserUpdatedFriends;
            await loggedInUser.save();

            return res.status(201).json({
                message: "Friend removed",
                user: relUser,
                // loggedInUser: loggedInUser,
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;