import express from "express";
import cors from "cors";
import session from "express-session";
import healthRouter from "./routes/health.js";
import discordRouter from "./routes/discord.js";
import { startExpiryJob } from "./lib/expiryJob.js";

const SESSION_SECRET = "some_random_secret_string";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 10 * 60 * 1000 },
  })
);

app.use("/api", healthRouter);
app.use("/api", discordRouter);

startExpiryJob();

export default app;
