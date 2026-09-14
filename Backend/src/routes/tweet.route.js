import { Router } from "express";
import {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserTweetById,
} from "../controllers/tweet.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const tweetRouter = Router();

// create tweet route
tweetRouter.route("/").post(verifyJWT , createTweet);

// fetch tweet posted by user route
tweetRouter.route("/user/:userId").get(verifyJWT , getUserTweetById)

// update and delete tweet route
tweetRouter.route("/:tweetId")
    .patch(verifyJWT , updateTweet)
    .delete(verifyJWT , deleteTweet)
    
export default tweetRouter;