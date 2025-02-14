import express from "express";
import http from "http";
import compression from "compression";
import cookieParser from "cookie-parser";
import "dotenv/config";
import "./dbConnection.js";
import userRoutes from "./Routes/UserRoute.js";
import addressRoute from "./Routes/Address.js";
import kyc from "./Routes/KycRoute.js";
import claimRequest from "./Routes/ClaimRequest.js";
import BarsRoute from "./Routes/BarsRoute.js";
import admin from "./Routes/AdminRoute.js";
import income from "./Routes/Income.js";
import rewardRoute from "./Routes/RewardsRoute.js";
import distributionRoute from "./Routes/DistributionRoute.js"
import settings from "./Routes/Settings.js";
import userTrans from "./Routes/UserTransaction.js";
import investmentRoutes from "./Routes/InvestmentRoute.js";
// import pages from "./Routes/AppRoutes.js";
import notification from "./Routes/NotificationRoute.js";
import { connectToMongo } from "./dbConnection.js";
import cors from 'cors';
import { urlNotFound } from "./Utils/Responses/index.js";
const app = express();
const AllowedOrigin = (origin, callback) => {
  const allowedOrigins = ['https://admin.knoone.com', 'https://acc.knoone.com', 'https://knoone.com', "http://localhost:3000", "http://localhost:5500", "http://localhost:3001", "http://192.168.0.243:3000", "http://192.168.0.193:3000", "http://192.168.0.193:3001", "http://192.168.0.150:3000", "http://192.168.1.7:3000", "http://localhost:5173", "http://localhost:5174", "https://www.oumvest.com","https://oumvest.com"];
  const isAllowed = allowedOrigins.includes(origin);
  callback(null, isAllowed ? origin : null);
};

// Use CORS middleware with dynamic origin determination
app.use(cors({
  origin: "*",
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const port = process.env.PORT || 5500;
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use("/api/v1", addressRoute);
app.use("/api/v1", income);
app.use("/api/v1", kyc);
app.use("/api/v1", claimRequest);
app.use("/api/v1", notification);
app.use("/api/v1", BarsRoute);
app.use("/api/v1", distributionRoute)
// app.use("/api/v1", productRoute); 
app.use("/api/v1", rewardRoute);
app.use("/api/v1", settings);
app.use("/api/v1", userRoutes);
app.use("/api/v1", userTrans);
app.use("/api/v1", admin);
app.use("/api/v1", investmentRoutes);
// app.use("/api/v1", pages);

// handling the error when no routes are found
app.use("/",(req,res)=>{
  res.status(200).send({
    status:200,
    message:"welcome to OUMVEST"

  })
})
app.all("*", (req, res, next) => {
  res.status(404).send(urlNotFound);
});
const server = http.createServer(app);
server.setTimeout(1000000);

(async () => {
  try {
    server.listen(port);
    await connectToMongo();
    console.log(`Server is running. (${port})`);
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();
