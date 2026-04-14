import { Router } from "express";
import { enhancePost } from "../controllers/ai.controllers.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = Router();

// POST /ai/enhance-post — User ka chhota prompt lega, AI se professional post banayega
router.route('/ai/enhance-post').post(wrapAsync(enhancePost));

export default router;
