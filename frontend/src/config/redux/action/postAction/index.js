import { clientServer } from "@/config";
import { asyncThunkCreator, createAsyncThunk } from "@reduxjs/toolkit";



export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async(_,thunkAPI) => {
    try {
        const res = await clientServer.get(`/posts`);

        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})

export const createPost = createAsyncThunk(
    "post/createPost",
    async(userData,thunkAPI) => {
        const {file,body} = userData;
    try {
        const formData = new FormData();
        formData.append("body",body);
        formData.append("media",file);
        
        const res = await clientServer.post(`/post`,formData,{
            headers: {
                "Content-Type": "multipart/form-data"
            },
            params:{token:userData.token}
            
        });

        if(res.status === 200) return thunkAPI.fulfillWithValue("Post Uploaded Successfully");
        else return thunkAPI.rejectWithValue("Post not uploaded");
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async({post_id},thunkAPI) => {
    try {
        const res = await clientServer.delete(`/delete_post`,{
            data:{
                post_id:post_id,
                token: localStorage.getItem("token")
            }    
        });
        return thunkAPI.fulfillWithValue("Post deleted");
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})

export const incrementLikes = createAsyncThunk(
    "post/incrementLikes",
    async({post_id},thunkAPI) => {
    try {
        const res = await clientServer.post(`/increament_post_like`,{
            post_id:post_id
        });
        return thunkAPI.fulfillWithValue("Likes incremented");
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})  


export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async({post_id},thunkAPI) => {
    try {
        const res = await clientServer.post(`/get_comments`,{
            post_id:post_id
        });
        return thunkAPI.fulfillWithValue({
            comments:res.data.comments,
            post_id:post_id
        });
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})

export const postComment = createAsyncThunk(
    "post/postComment",
    async(commentData,thunkAPI) => {
    try {
        const res = await clientServer.post(`/comment`,{
            token:localStorage.getItem("token"),
            post_id:commentData.post_id,
            commentBody:commentData.body
        });
        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || { message: error.message || "Server not reachable" });
    }
})

// AI Post Enhance — User ka chhota prompt bhejo, AI se professional post wapas aayega
export const enhancePost = createAsyncThunk(
    "post/enhancePost",
    async(data, thunkAPI) => {
        try {
            const res = await clientServer.post(`/ai/enhance-post`, {
                token: localStorage.getItem("token"),
                prompt: data.prompt
            });
            return thunkAPI.fulfillWithValue(res.data);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || { message: "AI service failed" }
            );
        }
    }
)

