import { Router } from "express";
import { activeCheck, createPost,getAllPosts,deletePost,commentPost,getCommentsByPost,deleteCommentOfUser,increament_likes } from "../controllers/posts.controllers.js";
import multer from "multer";
import { CloudinaryStorage } from 'multer-storage-cloudinary'; 
import { v2 as cloudinary } from 'cloudinary'; 
import wrapAsync from "../utils/wrapAsync.js";
const router = Router();


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//     }
// });

// const upload = multer({ storage: storage });
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ProConnect_Posts', // A folder name in my Cloudinary account
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
});

const upload = multer({ storage: storage });

router.route('/').get(activeCheck);
router.route('/post').post(upload.single('media'),wrapAsync(createPost));
router.route('/posts').get(wrapAsync(getAllPosts));
router.route('/delete_post').delete(wrapAsync(deletePost));
router.route('/comment').post(wrapAsync(commentPost));
router.route('/get_comments').post(wrapAsync(getCommentsByPost));
router.route('/delete_comment').delete(wrapAsync(deleteCommentOfUser));
router.route('/increament_post_like').post(wrapAsync(increament_likes));



export default router;