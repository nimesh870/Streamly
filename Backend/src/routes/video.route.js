import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
     publishVideo,
     deleteVideo,
     updateVideo,
     getVideoById,
     getAllVideos,
     togglePublished 
    } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route("/upload-video").post(
    upload.fields([
        {
            name : "video",
            maxCount : 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]),
    verifyJWT,
    publishVideo
)

videoRouter.route("/:videoId").delete(verifyJWT , deleteVideo)

videoRouter.route("/:videoId").patch(verifyJWT , upload.single("thumbnail") , updateVideo)

videoRouter.route("/:videoId").get(getVideoById)

videoRouter.route("/").get(getAllVideos)

videoRouter.route("/:videoId/toggle-publish").patch(verifyJWT , togglePublished)

export default videoRouter;