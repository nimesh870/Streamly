import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.route("/:commentId").post(verifyJWT , toggleCommentLike);

likeRouter.route("/:videoId").post(verifyJWT , toggleVideoLike);

likeRouter.route("/:tweetId").post(verifyJWT , toggleTweetLike);

likeRouter.route("/liked-videos").get(verifyJWT , getLikedVideos);

export default likeRouter;