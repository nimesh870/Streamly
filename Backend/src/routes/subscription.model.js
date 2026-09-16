import { Router } from "express";
import { 
    toggleSubscribe,
    getSubscribedChannels,
    getUserChannelSubscribers
} from "../controllers/subscription.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const subscriptionRouter = Router();

subscriptionRouter.route("/:channelId/subscribe").post(verifyJWT , toggleSubscribe);

subscriptionRouter.route("/:channelId").get(verifyJWT , getUserChannelSubscribers);

subscriptionRouter.route("/:subscriberId").get(verifyJWT , getSubscribedChannels);

export default subscriptionRouter;