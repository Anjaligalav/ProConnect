const { createSlice } = require("@reduxjs/toolkit")
import { loginUser, registerUser, getAboutUser, getAllUsers, getConnectionRequests, getMyConnectionRequests, sendConnectionRequest } from "../../action/authAction";


const initialState = {
    User : undefined,
    isError:false,
    isSuccess:false,
    isLoading:false,
    loggedIn:false,
    message:"",
    isTokenThere:false,
    profileFeched:false,
    connections: [],
    connectionRequest:[],
    all_users : [],
    all_profiles_fetched:false
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        reset: () => initialState,
        handleLoginUser:(state)=>{
            state.message = "hello";
        },
        emptyMessage:(state)=>{
            state.message = "";
        },
        setTokenIsThere:(state)=>{
            state.isTokenThere = true;
        },
        setTokenIsNotThere:(state)=>{
            state.isTokenThere = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.message = {
                    message:"knocking the door"
                }
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.loggedIn = true;
                state.message={
                    message: "Login is successful"
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.message = {
                    message:"Registering You..."
                }
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.message={
                    message: "Registration is successful, Please Login"
                };
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            
            .addCase(getAboutUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.profileFeched = true;
                state.User = action.payload.userProfile;
                state.message={
                    message: "User Data Fetched"
                };
                
            })

            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.all_profiles_fetched = true;
                state.all_users = action.payload.userProfile;
                state.message={
                    message: "User Data Fetched"
                };
                
            })
            .addCase(getAboutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(getConnectionRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.connections = action.payload;
                state.message={
                    message: "Connection Requests Fetched"
                };
                
            })
            .addCase(getConnectionRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.connectionRequest = action.payload;
                state.message={
                    message: "Connection Requests Fetched"
                };
                
            })
            .addCase(getMyConnectionRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(sendConnectionRequest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.message={
                    message: "Connection Request Sent"
                };
                
            })
            .addCase(sendConnectionRequest.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            
    }
})

export const {reset,emptyMessage,setTokenIsThere,setTokenIsNotThere} = authSlice.actions
export default authSlice.reducer