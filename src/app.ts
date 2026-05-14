import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.middleware.js";
import { connectRedis } from "./configs/cache.config.js";
import { bullBoardAdapter } from "./configs/bull-board.config.js";
import feedbackRouter from "./modules/feedback/feedback.routes.js";
import donateRouter from "./modules/donate/donate.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import blogRouter from "./modules/blog/blog.routes.js";
import "./events/admin.events.js";
import "./events/donate.event.js";
import "./events/auth.events.js";
// import featureRouter from "./modules/feature/feature.routes.js";
// import "./queues/workers/feature.worker.js"

const app = express();

const whitelist = [`http://localhost:${process.env.PORT}`];
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allowed?: boolean) => void,
  ) {
    if (whitelist.indexOf(origin || "") !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  credentials: true, //Allow cookies/auth headers
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

(async () => {
  await connectRedis();
})();

//ROUTES
/* app.use("/", featureRouter); */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/donate", donateRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/blog", blogRouter);
// app.use("/queues", bullBoardAdapter.getRouter());

// HANDLER FOR UNKNOWN ROUTES
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.path} not found` },
  });
});

//GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
