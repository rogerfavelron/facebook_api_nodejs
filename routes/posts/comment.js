const express = require('express');
const router = express.Router({mergeParams:true});
const { body, validationResult } = require('express-validator');
const  getTokenData = require("../../utils/getTokenData");

router.use(
  passport.authenticate("jwt", { session: false })
);
router.use(getTokenData);

router.post("/",
    body("comment", "comment required").trim().isLength({ min: 1 }),

    async (req, res, next) => {
        const { comment } = req.body;

        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            const newComment = new Comment({
                user: req.payload._id,
                comment: comment,
                date: new Date(),
                post: req.params.postId,
            });

            const savedComment = await newComment.save();

            const relPost = await Post.findById(req.params.postId);
            relPost.comments.push(savedComment);
            await relPost.save();

            const populatedComment = await Comment.findById(
                savedComment._id
            ).populate("user");
            return res
                .status(201)
                .json({ message: "Comment saved", comment: populatedComment });
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
);

router.put(
    "/:commentId",
  
    body("comment", "comment required").trim().isLength({ min: 1 }).escape(),
  
    async (req, res, next) => {
      const { comment } = req.body;
  
      const result = validationResult(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
  
      try {
        const relComment = await Comment.findById(req.params.commentId);
  
        if (!relComment) {
          return res.status(404).json({ message: "Comment not found" });
        }
  
        if (relComment.user != req.payload._id) {
          return res
            .status(401)
            .json({ message: "You may only edit your own comments" });
        }
  
        relComment.comment = comment;
        const updatedComment = await relComment.save();
  
        return res.status(201).json({
          message: "Succesfully updated comment",
          comment: updatedComment,
        });
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }
  );
  
  router.delete('/commentId',async (req,res,next)=>{
    try{
        const relComment = await Comment.findById(req.params.commentId);
        if(!relComment){
            return res.status(404).json({
                message:"comment not found"
            })
        }
        if(relComment.author!=req.payload._id){
            return res.status(401).json({
                message:"you can only delete your own comments"
            })
        }
        const deletedComment = await comment.findByIdAndDelete(req.params.commentId);
        if(deletedComment){
            return res
            .status(200)
            .json({
                message:'successfully deleted', comment:deletedComment
            })
        }

    }
    catch(e){
        return res.status(500).json({
            error:e.message
        })
    }
  })

module.exports = router;