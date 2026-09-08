import { Router } from "express";
import { upload } from "../middlewares/multer.middleware";
import { publishVideo } from "../controllers/video.controller";

const videoRouter = Router();

router.route("/upload-videos").post(
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
    publishVideo
)

export default videoRouter;