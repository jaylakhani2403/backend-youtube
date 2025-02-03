import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,getCurrentUser, changeCurrentPassword, updateAccountDetails,
    updateUserAvatar, updateUserCoverImage, getChennalUserProfile,getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middleweres/multer.middleware.js";
import { verifyJWT } from "../middleweres/auth.middleweres.js";
const router = Router();

// Middleware to handle upload errors
const uploadMiddleware = (req, res, next) => {
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error("Upload Error:", err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
};

// User Registration Route
router.route("/register").post(uploadMiddleware, registerUser);


router.route("/login").post(loginUser)


router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getChennalUserProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router;
