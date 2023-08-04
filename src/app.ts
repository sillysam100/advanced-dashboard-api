import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import path from "path";

import * as middlewares from "./middlewares/error";
import userRoutes from "./routes/user";
import siteRoutes from "./routes/iiiadmin/site";
import registerRoutes from "./routes/iiiadmin/register";
import customerRoutes from "./routes/iiicustomers/customers";
import pageRoutes from "./routes/iiiadmin/page";
import organizationRoutes from "./routes/iiiadmin/organization";
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
app.use("/api/iiicontrol", siteRoutes);
app.use("/api/iiicontrol", registerRoutes);
app.use("/api/iiicontrol", organizationRoutes);
app.use("/api/iiicontrol", pageRoutes);
app.use("/api/iiicustomers", customerRoutes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
