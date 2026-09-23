import { Router } from "express";

import { 
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const dashboardRouter = Router();

dashboardRouter.route("/:channelId")
    .get(verifyJWT , getChannelStats)
    .get(verifyJWT , getChannelVideos)

export default dashboardRouter;