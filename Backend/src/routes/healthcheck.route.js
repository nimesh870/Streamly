import { healthCheck } from "../controllers/healthcheck.controller.js";
import { Router } from "express";

const healthCheckRoute = Router();

healthCheckRoute.route("/").get(healthCheck);

export default healthCheckRoute;