import { Playlist } from "../models/playlist.models.js"
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

const createPlaylist = AsyncHandler(async (req, res) => {
    const {name , description} = req.body;

    if ( typeof name !== "string" || typeof description !== "string" || name?.trim() === "" || description?.trim() === "") {
        throw new ApiError(400 , "Name and description are required.")
    }

    const playlist = await Playlist.create({
        name : name.trim(),
        description : description.trim(),
        owner : req.user._id
    })

    return res.status(201).json(
        new ApiResponse(201 , playlist , "Play successfully created.")
    )
})

const getUserPlaylists = AsyncHandler(async (req, res) => {

    const getAllPlaylist = await Playlist.find({
        owner : req.user._id
    })

    if (!playlist) {
        throw new ApiError(404 , "No playlist found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , getAllPlaylist , "Playlist fetched successfully.")
    )
})

const getPlaylistById = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId) {
        throw new ApiError(400 , "No playlist id found.")
    }

    const fetchPlaylistById = await Playlist.findOne({
        _id : playlistId,
        owner : req.user._id
    })

    if (!fetchPlaylistById) {
        throw new ApiError(404 , "Playlist with such Id's not found.")
    }

    return res.status(200).json(
        new ApiResponse(200 , fetchPlaylistById , "Playlist found.")
    )
})

const addVideoToPlaylist = AsyncHandler(async (req, res) => {
})

const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
})

const deletePlaylist = AsyncHandler(async (req, res) => {
})

const updatePlaylist = AsyncHandler(async (req, res) => {
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}