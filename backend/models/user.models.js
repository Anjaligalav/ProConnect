import mongoose, { mongo } from "mongoose";


const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required : true
    },
    username:{
        type: String,
        required : true,
        unique: true
    },
    email:{
        type: String,
        required : true,
        unique: true
    },
    active:{
        type: Boolean,
        default:true
    },
    password:{
        type: String,
        required : true,
    },
    profilePicture: {
        type: String,
        default : 'https://res.cloudinary.com/dqb3omaz4/image/upload/v1758127262/ProConnect_Profiles/default.png_l7trtm.png',
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
    token:{
        type: String,
        default: ''
    }
});

const User = mongoose.model("User",UserSchema);
export default User;