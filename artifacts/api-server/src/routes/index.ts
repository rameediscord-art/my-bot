import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import discordRouter from "./discord.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(discordRouter);

export default router;
