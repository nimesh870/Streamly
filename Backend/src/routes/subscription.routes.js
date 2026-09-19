import { Router } from "express";
import { 
    toggleSubscribe,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const subscriptionRouter = Router();

subscriptionRouter.route("/:channelId/subscribe").post(verifyJWT , toggleSubscribe);

subscriptionRouter.route("/:channelId").get(verifyJWT , getUserChannelSubscribers);

subscriptionRouter.route("/:subscriberId").get(verifyJWT , getSubscribedChannels);

export default subscriptionRouter;