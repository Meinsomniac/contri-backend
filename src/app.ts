import express from "express";
import cors from "cors";
import helmet from "helmet";
// import rateLimit from "express-rate-limit";
import { config } from "dotenv";
import errorHandler from "@infrastructure/middleware/errorHandler";
import router from "@presentation/routes/route";

//load environment variables
config();

//Initialize express app
const app = express();

//sequrity middlewares
app.use(helmet());
app.use(
  cors({
    credentials: true,
  }),
);

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use("/api/", limiter);

//body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Contri Backend",
  });
});

app.use(errorHandler);

export default app as express.Application;
