import mongoose, { mongo } from "mongoose";
import Comment from "./comments.models.js";

const PostSchema = mongoose.Schema({
    userId: {
        type :mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    body:{
        type: String,
        required : true
    },
    likes:{
        type: Number,
        default:0
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    media:{
        type: String,
        default: ''
    },
    active:{
        type: Boolean,
        default:true
    },
    fileType:{
        type: String,
        default: ''
    }
});


PostSchema.post("findOneAndDelete", async (post) => {
    if (post) {
        await Comment.deleteMany({ _id: { $in: post.comments } });
        await Comment.deleteMany({ postId: post._id });
        console.log("Associated comments deleted");
    }
});

const Post = mongoose.model("Post",PostSchema);
export default Post;