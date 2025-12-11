import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { use } from "react";


export const loginUser = createAsyncThunk(
    "user/login",
    async(user,thunkAPI) => {
    try {
        const res = await clientServer.post(`/login`,{
            password: user.password,
            email: user.email
        });

        if(res.data.token){
            localStorage.setItem("token",res.data.token);
        }else{
            return thunkAPI.rejectWithValue({
                message:"Token Not Provided"
            });
        }

        return thunkAPI.fulfillWithValue(res.data.token);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
})

export const registerUser = createAsyncThunk(
    "user/register",
    async(user,thunkAPI)=>{
        try{
            const res = await clientServer.post(`/register`,{
                username: user.username,
                password: user.password,
                email: user.email,
                name: user.name
            });
            return res.data;

        }catch(error){
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)

export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async(user,thunkAPI) => {
    try {
        const res = await clientServer.get(`/get_user_and_profile`,{
            params:{token:user.token}
        });

        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",
    async(user,thunkAPI) => {
    try {
        const res = await clientServer.get(`/get_all_profiles`,{
            params:{token:user.token}
        });

        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async(userData,thunkAPI) => {
    try {
        console.log(userData);
        const res = await clientServer.post(`/user/send_connection_request`,{
            token:userData.token,
            connectionId:userData.connectionId
        }
        );
        thunkAPI.dispatch(getConnectionRequests({token:userData.token}));
        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

export const getConnectionRequests = createAsyncThunk(
    "user/getConnectionRequests",
    async(user,thunkAPI) => {
    try {
        const res = await clientServer.get(`/user/getConnectionRequests`,{
            params:{token:user.token}
        });
        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

export const getMyConnectionRequests = createAsyncThunk(
    "user/getMyConnectionRequests",
    async(user,thunkAPI) => {
    try {
        const res = await clientServer.get(`/user/user_connection_request`,{
            params:{token:user.token}
        });
        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

export const acceptConnectionRequest = createAsyncThunk(
    "user/acceptConnectionRequest",
    async(userData,thunkAPI) => {
    try {
        const res = await clientServer.post(`/user/accept_connection_request`,{
            token:userData.token,
            requestId:userData.connectionId,
            action_type: userData.action
        });
        thunkAPI(dispatch(getConnectionRequests({token:userData.token})));
        thunkAPI.dispatch(getMyConnectionRequests({token:userData.token}));
        return thunkAPI.fulfillWithValue(res.data);
    
    } catch (error) {
        return thunkAPI.rejectWithValue(error.res.data);
    }
})

