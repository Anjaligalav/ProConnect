
import { Router } from "express";
import { register,login,uploadProfilePicture,updateUserProfile,getUserAndProfile,
  updateProfileData,getAllUserProfile,downloadProfile,sendConnectionRequest,getMyConnectionRequests,whatAreMyConnections,acceptConnectionRequest,getUserProfileBasedOnUsername } from "../controllers/user.controllers.js";
import multer from "multer";
import { get } from "mongoose";
import { CloudinaryStorage } from 'multer-storage-cloudinary'; 
import { v2 as cloudinary } from 'cloudinary'; 
import wrapAsync from "../utils/wrapAsync.js";

const router = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ProConnect_Profiles', // New folder for profile pictures
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

router.route('/upload_profile_picture').post(upload.single('profile_picture'),wrapAsync(uploadProfilePicture))

router.route('/register').post(wrapAsync(register));
router.route('/login').post(wrapAsync(login));
router.route('/user_update').post(wrapAsync(updateUserProfile));
router.route('/get_user_and_profile').get(wrapAsync(getUserAndProfile));
router.route('/update_profile_data').post(wrapAsync(updateProfileData));
router.route('/get_all_profiles').get(wrapAsync(getAllUserProfile));
router.route('/user_download_resume').get(wrapAsync(downloadProfile));
router.route('/user/send_connection_request').post(wrapAsync(sendConnectionRequest));
router.route('/user/getConnectionRequests').get(wrapAsync(getMyConnectionRequests));
router.route('/user/user_connection_request').get(wrapAsync(whatAreMyConnections));
router.route('/user/accept_connection_request').post(wrapAsync(acceptConnectionRequest));
router.route('/user/get_profile_based_on_username').get(wrapAsync(getUserProfileBasedOnUsername));
export default router;