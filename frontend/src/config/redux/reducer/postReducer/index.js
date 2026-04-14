const { createSlice } = require("@reduxjs/toolkit")
import { createPost, getAllPosts, deletePost, incrementLikes, getAllComments, postComment, enhancePost } from "../../action/postAction"

const initialState = {
    posts : [],
    isError:false,
    logedIn:false,
    isLoading:false,
    message:"",
    postfetched:false,
    comments:[],
    postId:"",
    aiLoading: false,
    aiError: false,
    aiMessage: ""
}

const postSlice = createSlice({
    name:"post",
    initialState,
    reducers:{
        reset: ()=>initialState,
        resetPostId:(state)=>{
            state.postId = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllPosts.pending, (state) => {
                state.isLoading = true;
                state.message="Fetching all the posts";
            })
            .addCase(getAllPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.postfetched=true;
                state.posts = action.payload.posts;
            })
            .addCase(getAllPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.message = action.payload.message;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.message = action.payload.message;
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(incrementLikes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.message = action.payload.message;
            })
            .addCase(incrementLikes.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.postId = action.payload.post_id;
                state.comments = action.payload.comments;
            })
            .addCase(getAllComments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(postComment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.message = action.payload.message;
            })
            .addCase(postComment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // AI Enhance Post — Loading state
            .addCase(enhancePost.pending, (state) => {
                state.aiLoading = true;
                state.aiError = false;
                state.aiMessage = "AI is thinking...";
            })
            // AI Enhance Post — Success
            .addCase(enhancePost.fulfilled, (state, action) => {
                state.aiLoading = false;
                state.aiError = false;
                state.aiMessage = "Post enhanced!";
            })
            // AI Enhance Post — Error
            .addCase(enhancePost.rejected, (state, action) => {
                state.aiLoading = false;
                state.aiError = true;
                state.aiMessage = action.payload?.message || "AI enhancement failed";
            })
    }
})

export const {reset,resetPostId} = postSlice.actions
export default postSlice.reducer