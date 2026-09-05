import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImg } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// register route
router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImg",
            maxCount : 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT , logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/update-password").patch(verifyJWT , changeCurrentPassword)

router.route("/user-profile").get(verifyJWT , getCurrentUser)

router.route("/update-avatar").patch(verifyJWT , upload.single("avatar") , updateAvatar)

router.route("/update-coverImage").patch(verifyJWT , upload.single("coverImg") , updateCoverImg)

export default router;