import User from "../models/user.models.js";
import Profile from "../models/profile.models.js";
import ConnectionRequest from "../models/connection.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import axios from "axios"; 


const convertUserDataToPDF = async (userData) => {
    const doc = new PDFDocument();
    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);

    doc.pipe(stream);

    // Fetch the profile picture from the Cloudinary URL
    if (userData.userId.profilePicture) {
        try {
            const imageResponse = await axios.get(userData.userId.profilePicture, {
                responseType: 'arraybuffer'
            });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
            doc.image(imageBuffer, { 
                width: 100,
                align: "center"
            });
        } catch (error) {
            console.error("Could not fetch profile picture for PDF:", error.message);
        }
    }
    
    doc.moveDown(2); 

    doc.fontSize(14).text(`Name: ${userData.userId.name}`);

    doc.fontSize(14).text(`UserName: ${userData.userId.username}`);
    doc.fontSize(14).text(`Email: ${userData.userId.email}`);
    doc.fontSize(14).text(`Bio: ${userData.bio}`);

    doc.fontSize(14).text("Education");
    userData.education.forEach((edu,index) => {
        doc.fontSize(14).text(`School: ${edu.school}`);
        doc.fontSize(14).text(`Degree: ${edu.degree}`);
        doc.fontSize(14).text(`Field of Study: ${edu.fieldOfStudy}`);
    })

    doc.fontSize(14).text("Past Work");
    userData.pastWork.forEach((work,index) => {
        doc.fontSize(14).text(`Company: ${work.company}`);
        doc.fontSize(14).text(`Position: ${work.position}`);
        doc.fontSize(14).text(`Years: ${work.years}`);
    })


    doc.end();
    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

export const register = async(req,res)=>{
   
    const { name,email,password,username} = req.body;

    if(!name || !email || !password || ! username) return res.status(400).json({message:"All fields are required"});

    const user = await User.findOne({email});

    if(user) return res.status(400).json({message:"User already exists"});
    const hashPassword = await bcrypt.hash(password,10);

    const newUser = new User({
        name,
        email,
        password:hashPassword,
        username
    });

    await newUser.save();

    const profile = new Profile({
        userId: newUser._id
    })

    await profile.save();
    return res.json({message:"User Created"});

}

export const login = async(req,res)=>{

    const {email,password} = req.body;

    if(!email || !password) return res.status(400).json({message:"All fields are required"});

    const user = await User.findOne({email});

    if(!user) return res.status(404).json({message:"User does not exist please register"});

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch) return res.status(400).json({message:"Invalid credentials"});

    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({_id:user._id},{ token });
    await user.save();
    return res.json({message:"Login successful","token":token});
    
}

export const uploadProfilePicture = async(req,res)=>{
    const token = req.body.token;
    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User does not exist please register"});

    user.profilePicture = req.file.path;
    await user.save();
    
    return res.json({message:"Profile picture Updated"});
}

export const updateUserProfile = async(req,res)=>{
    const {token, ...newUserData} = req.body;

    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const {username,email} = newUserData;

    // Check if new email/username is taken by someone else
    if(username || email){
        const existingUser = await User.findOne({
            $and: [
                { $or: [{ username }, { email }] },
                { _id: { $ne: user._id } } // Khud ka purana email match na kare
            ]
        });
        if(existingUser) return res.status(400).json({message:"Username or Email already taken"});
    }

    Object.assign(user,newUserData);
    await user.save();
    return res.json({message:"User Updated"});
    
}

export const getUserAndProfile = async(req,res) =>{

    const token = req.query.token;
    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const userProfile = await Profile.findOne({userId:user._id}).populate('userId','name username email profilePicture');
    return res.json({userProfile});
}

export const updateProfileData = async(req,res) =>{
        
    const {token, ...newProfileData} = req.body;

    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const profile_to_update = await Profile.findOne({userId:user._id});

    Object.assign(profile_to_update,newProfileData);
    await profile_to_update.save();
    return res.json({message:"Profile Updated"});

}


export const getAllUserProfile = wrapAsync(async(req, res) => {
    const token = req.query.token;
    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});
    
    let query = {}; 

    if (token) {
        const currentUser = await User.findOne({ token });
        if (currentUser) {
            query = { userId: { $ne: currentUser._id } };
        }
    }

    const userProfile = await Profile.find(query)
        .populate('userId', 'name username email profilePicture');
        
    return res.json({ userProfile });
});


export const downloadProfile = async (req, res) => {

    const user_id = req.query.id;
    const userProfile = await Profile.findOne({ userId: user_id }).populate('userId', 'name username email profilePicture');
    let outputPath = await convertUserDataToPDF(userProfile); 
    return res.json({ message: outputPath });

}


export const sendConnectionRequest = async(req,res)=>{
    const {token,connectionId} = req.body;
    

    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const connectionUser = await User.findOne({_id:connectionId});
    if(!connectionUser) return res.status(404).json({message:"Connection User not found"});

    const existingRequest = await ConnectionRequest.findOne({
        userId:user._id,
        connectionId:connectionUser._id
    })

    if(existingRequest) return res.status(400).json({message:"Connection request already sent"});

    const request = new ConnectionRequest({
        userId:user._id,
        connectionId:connectionUser._id
    })
    await request.save();
    return res.json({message:"Connection request sent"});

}

export const getMyConnectionRequests = async(req,res)=>{
   
    const token = req.query.token;;
    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const connections = await ConnectionRequest.find({userId:user._id}).populate('connectionId','name username email profilePicture');
    return res.json(connections);
}

export const whatAreMyConnections = async(req,res)=>{
        const token = req.query.token;;
        const user = await User.findOne({token});

        if(!user) return res.status(404).json({message:"User not found"});

        const connections = await ConnectionRequest.find({connectionId:user._id}).populate('userId','name username email profilePicture');
        return res.json(connections);
}

export const acceptConnectionRequest = async(req,res)=>{
    const {token,requestId , action_type} = req.body;
    
    const user = await User.findOne({token});

    if(!user) return res.status(404).json({message:"User not found"});

    const request = await ConnectionRequest.findOne({_id:requestId});

    if(!request) return res.status(404).json({message:"Request not found"});

    if(action_type === "accept"){
        request.status = true;
        await request.save();
        return res.json({message:"Request accepted"});
    }else{
        request.status = false;
        await request.save();
        return res.json({message:"Request rejected"});
    }
    
}

export const getUserProfileBasedOnUsername = async(req,res)=>{
    const {username} = req.query;
    const user = await User.findOne({username});

    if(!user) return res.status(404).json({message:"User not found"});


    const userProfile = await Profile.findOne({userId:user._id}).populate('userId','name username email profilePicture');
    return res.json({userProfile});
    
}