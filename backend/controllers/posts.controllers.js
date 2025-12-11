import User from "../models/user.models.js";
import Post from "../models/posts.models.js";
import Comment from "../models/comments.models.js";


export const activeCheck = async(req,res)=>{
    return res.status(200).json(
        {message:"Running"}
    )
}

export const createPost = async(req,res)=>{
    const token = req.query.token;
    try{

        const user = await User.findOne({token});

        if(!user) return res.status(404).json({message:"User not found"});

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            // Use req.file.path for the Cloudinary URL
            media: req.file !== undefined ? req.file.path : "", 
            // Cloudinary provides the format, e.g., 'jpeg', 'png'
            fileType: req.file !== undefined ? req.file.format : "" 
        });

        await post.save();
        return res.json({message:"Post created"});
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

export const getAllPosts = async(req,res) =>{
        const posts = await Post.find()
        .sort({ createdAt: -1 }) 
        .populate('userId','name username email profilePicture');
        return res.json({posts:posts});
    
}

export const deletePost = async(req,res) =>{
    
        const {token,post_id} = req.body;

        const user = await User.findOne({token}).select("_id");

        if(!user) return res.status(404).json({message:"User not found"});

        const post = await Post.findOne({_id:post_id});

        if(!post) return res.status(401).json({message:"Post not found"});

        if(post.userId.toString() !== user._id.toString()) return res.status(401).json({message:"Unauthorized"});

        await Post.findByIdAndDelete(post_id);
        return res.json({message:"Post deleted"});
}

export const commentPost = async(req,res) =>{
        const {token,post_id,commentBody} = req.body;

        const user = await User.findOne({token}).select("_id");

        if(!user) return res.status(404).json({message:"User not found"});

        const post = await Post.findOne({_id:post_id});

        if(!post) return res.status(401).json({message:"Post not found"});

        const comment = new Comment({
            userId:user._id,
            postId:post_id,
            body:commentBody
        });
        await comment.save();
        return res.status(200).json({message:"Commented"});
}

export const getCommentsByPost = async(req,res)=>{
        
        const {post_id} = req.body;

        const post = await Post.findOne({_id:post_id});

        if(!post) return res.status(401).json({message:"Post not found"});

        const comments = await Comment.find({ postId: post_id })
        .populate('userId','name username profilePicture')
        .sort({ _id: -1 }); // Naya comment phle dikhega
        
    return res.json({comments:comments});
    
}

export const deleteCommentOfUser = async(req,res) =>{
 
        
        const {token,comment_id} = req.body;
        const user = await User.findOne({token}).select("_id");

        if(!user) return res.status(404).json({message:"User not found"});

        const comment = await Comment.findOne({_id:comment_id});

        if(!comment) return res.status(401).json({message:"Comment not found"});

        if(comment.userId.toString() !== user._id.toString()) return res.status(401).json({message:"Unauthorized"});

        await Comment.deleteOne({_id:comment_id});
        return res.json({message:"Comment deleted"});

}

export const increament_likes = async(req,res)=>{
        const {post_id} = req.body;

        const post = await Post.findOne({_id:post_id});

        if(!post) return res.status(401).json({message:"Post not found"});

        post.likes = post.likes + 1;

        await post.save();

        return res.json({message:"Likes incremented"});
}

