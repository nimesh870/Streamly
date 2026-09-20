import { Router } from "express";
import { 
    addCommentToTweet,
    updateComment,
    deleteComment,
    getTweetComment,
    getVideoComments,
    addCommentToVideo
 } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentRouter = Router();

commentRouter.route("/video/:videoId").post(verifyJWT , addCommentToVideo);

commentRouter.route("/tweet/:tweetId").post(verifyJWT , addCommentToTweet);

commentRouter.route("/:commentId")
        .patch(verifyJWT , updateComment)
        .delete(verifyJWT , deleteComment);

commentRouter.route("/:videoId").get(verifyJWT , getVideoComments);

commentRouter.route("/:tweetId").get(verifyJWT , getTweetComment)

export default commentRouter;