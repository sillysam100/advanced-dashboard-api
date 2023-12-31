import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";

import * as middlewares from "./middlewares/error";
import userRoutes from "./routes/user";
import siteRoutes from "./routes/site";
import registerRoutes from "./routes/register";
import pageRoutes from "./routes/page";
import organizationRoutes from "./routes/organization";
import MessageResponse from "./interfaces/MessageResponse";

import passport from "passport";
import "./config/passport";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/api", userRoutes);
app.use("/api", siteRoutes);
app.use("/api", registerRoutes);
app.use("/api", organizationRoutes);
app.use("/api", pageRoutes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
