import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const likeRouter = Router();

likeRouter.route("/:commentId/like-comment").post(verifyJWT , toggleCommentLike);

likeRouter.route("/:videoId/like-video").post(verifyJWT , toggleVideoLike);

likeRouter.route("/:tweetId/like-tweet").post(verifyJWT , toggleTweetLike);

likeRouter.route("/liked-videos").get(verifyJWT , getLikedVideos);

export default likeRouter;