import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({
    limit : "16kb"
}));
app.use(express.urlencoded(
    {
        extended: true , 
        limit : "16kb"
    }
))
app.use(express.static("public"))

// import and configure router
import router from "./routes/user.route.js";
app.use("/api/v1/users" , router)

// import and configure video router
import videoRouter from "./routes/video.route.js";
app.use("/api/v1/videos" , videoRouter)

// import and configure playlist router
import playlistRouter from "./routes/playlist.route.js";
app.use("/api/v1/playlist" , playlistRouter)

// import and configure tweet router
import tweetRouter from "./routes/tweet.route.js";
app.use("/api/v1/tweet" , tweetRouter)

// import and configure like router
import likeRouter from "./routes/like.route.js";
app.use("/api/v1/like" , likeRouter)

// import and configure subscription router
import subscriptionRouter from "./routes/subscription.routes.js";
app.use("/api/v1/subscription" , subscriptionRouter)

// import and configure comment router
import commentRouter from "./routes/comment.route.js";
app.use("/api/v1/comment" , commentRouter)

// import and configure dashboard router
import dashboardRouter from "./routes/dashboard.route.js";
app.use("api/v1/stats" , dashboardRouter)

export default app;