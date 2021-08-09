const express = require('express');
const router = express.Router({mergeParams:true});
const {body , validationResult} = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models/Post');
const passport = require('passport');
const commentRouter = require('./comment');

//use passport-jwt for authentication
const  getTokenData = require("../../utils/getTokenData");
router.use('/:postId/comments',commentRouter);
router.use(
  passport.authenticate("jwt", { session: false })
);
router.use(getTokenData);


//GET get the feed(friends' posts and self posts) for a user 
router.get('/', async(req,res,next)=>{

console.log("got a get post request ");
//get all the posts of the friends and user, show the last loaded 10
const loggedInUser = await User.findOne({_id:req.payload._id});
const posts = await Post.find({
    author:[loggedInUser._id, ...loggedInUser.friends]
})
.sort({date:"desc"})
.limit(10)
.populate('author')

if(posts){
    return res.status(200).json({posts:posts})
}
else{
    return res.status(500).json({error:err.message})
}
})

router.post('/',
body("content","Content required").trim().isLength({min:1}),
async (req,res,next)=>{
    const {content} = req.body;
    const result = validationResult(req);
    if(!result.isEmpty()){
        return res.status(400).json({errors:result.array()})
    }
    try{
        const newPost = new Post({
            author:req.payload._id,
            content:content,
            date:new Date(),
            comments:[],
            likes:0
        })

        const savedPost = await newPost.save();
        const relPost = await Post.findById(savedPost._id).populate('author');
        if(relPost){
            return res.status(201).json({message:'successfully posted', post:relPost})
        }
    }
    catch(e){
        return res.status(500).json({error:e.message});
    }
}
)

//PUT edit a post
router.put('/:postId',
body('content','content required').trim().isLength({min:1}).escape(),
async (req,res,next)=>{
    const {content} = req.body;
    const result = validationResult(req);
    if(!result.isEmpty()){
        return res.status(400).json({errors:result.array()});
    }
    try{
        const relPost = await Post.findById(req.params.postId);
        if(!relPost){
            return res.status(404).json({
                message:"post not found"
            })
        }
        if(relPost.author!= req.payload._id){
            return res.status(401).json({
                message:"you can only edit your own posts"
            })
        }
        relPost.content = content;
        const updatedPost = await relPost.save();

        return res.status(201).json({
            message:"post is successfully updated",
            post:updatedPost
        })

    }
    catch(e){
        return res.status(500).json({
            error:e.message
        })
    }

}
)

//PUT handle liking a post
router.put('/:postId/like',async (req,res,next)=>{

    try{
        const relPost = await Post.findById(req.params.postId);
        if(!relPost){
            return res.status(404).json({
                message:"post not found"
            })
        }
        relPost.likes +=1;
        const updatedPost = await relPost.save();

        return res.status(201).json({
            message:"post is successfully updated",
            post:updatedPost
        })

    }
    catch(e){
        return res.status(500).json({
            error:e.message
        })
    }
})

//DELETE handle deleting post
router.delete('/:postId', async(req,res,next)=>{
    try{
        const relPost = await Post.findById(req.params.postId);
        if(!relPost){
            return res.status(404).json({
                message:"post not found"
            })
        }
        if(relPost.author!=req.payload._id){
            return res.status(401).json({
                message:"you can only delete your own posts"
            })
        }
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        if(deletedPost){
            return res
            .status(200)
            .json({
                message:'successfully deleted', post:'deletedPost'
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