import { ApiResponse } from "../utils/ApiResponse";
import { AsyncHandler } from "../utils/AsyncHandler";

const healthCheck = AsyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "OK"
            },
            "Server is healthy."
        )
    );
});

export {
    healthCheck
}