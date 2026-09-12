import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

// create playlist
playlistRouter.route("/").post(verifyJWT , createPlaylist)

// fetch all playlist
playlistRouter.route("/").get(verifyJWT , getUserPlaylists)

// fetch playlist by id
playlistRouter.route("/:playlistId").get(verifyJWT , getPlaylistById)

// add video to playlist and remove video from playlist
playlistRouter.route("/:playlistId/videos")
    .post(verifyJWT , addVideoToPlaylist)
    .delete(verifyJWT , removeVideoFromPlaylist)

// get playlist by id , delete and update playlist
playlistRouter.route("/:playlisId")
    .get(verifyJWT , getPlaylistById)
    .delete(verifyJWT , deletePlaylist)
    .patch(verifyJWT , updatePlaylist)


export default playlistRouter