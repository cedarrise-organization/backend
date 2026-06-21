import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.middleware.js";
import { connectRedis } from "./configs/cache.config.js";
import { bullBoardAdapter } from "./configs/bull-board.config.js";
import carouselRouter from "./modules/clientside/carousels/carousels.routes.js";
import feedbackRouter from "./modules/clientside/feedback/feedback.routes.js";
import donateRouter from "./modules/clientside/donate/donate.routes.js";
import blogRouter from "./modules/clientside/blog/blog.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import ashRouter from "./modules/ash/ash.routes.js";
import tacotsRouter from "./modules/tacots/tacots.routes.js";
import lookupRouter from "./modules/lookup/lookup.routes.js";
import capacityRouter from "./modules/capacity/capacity.routes.js";
import volunteerRouter from "./modules/volunteer/volunteer.routes.js";
import outreachRouter from "./modules/outreaches/outreaches.routes.js";
import dashboardRouter from "./modules/dashboard/dashboard.routes.js";
import generalRouter from "./modules/general/general.routes.js";
// import featureRouter from "./modules/feature/feature.routes.js";
import "./events/admin.events.js";
import "./events/auth.events.js";
import "./events/donate.events.js";
import "./events/tacots.events.js";
import "./events/ash.events.js";
// import "./events/feature.event.js"
import { scheduleWeeklyNotificationJob, testAddtoQueue } from "./queues/notifications.queue.js";
import "./queues/workers/deleteCloudinaryAsset.worker.js";
import "./queues/workers/notifications.worker.js";
// import "./queues/workers/feature.worker.js"

const app = express();

const whitelist = [`http://localhost:3002`, `https://cedarrise.vercel.app`];
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
  allowedHeaders: ["Content-Type", "Authorization", "Content-Disposition"],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

app.use(express.json());
// app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

(async () => {
  await connectRedis();
})();

(async () => {
  await scheduleWeeklyNotificationJob();
})();

// (async () => {
//   await testAddtoQueue(); 
// })();
 
//ROUTES
/* app.use("/", featureRouter); */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/blogs", blogRouter);
app.use("/api/v1/donate", donateRouter);
app.use("/api/v1/feedback", feedbackRouter);
app.use("/api/v1/carousels", carouselRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/volunteer", volunteerRouter);
app.use("/api/v1/lookup", lookupRouter);
app.use("/api/v1/general", generalRouter);
app.use("/api/v1/forms/ash", ashRouter);
app.use("/api/v1/forms/tacots", tacotsRouter);
app.use("/api/v1/forms/outreaches", outreachRouter);
app.use("/api/v1/forms/capacity-building", capacityRouter);

// BULL BOARD DASHBOARD. (ADD AUTH N' AUTH IN PRODUCTION)
app.use("/api/v1/queues", bullBoardAdapter.getRouter());

// INTRO ROUTE HANDLER
app.get("/api/v1", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the cedarrise api",
  });
});

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
