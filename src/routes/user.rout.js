import { Router } from "express";
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller.js";
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

export default router;
