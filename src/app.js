import express from "express";
import cors from "cors";
import helmet from "helmet";           
import rateLimit from "express-rate-limit"; 
import compression from "compression";   

import router from "./routes/index.js";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";

const app = express();

app.use(helmet()); 

app.use(compression()); 

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // Maksimal 100 request per IP
    message: "Too many requests from this IP. Please try again later.",
    standardHeaders: true, 
    legacyHeaders: false,
});
const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 10, // Maksimal 10 kali percobaan login/register gagal per IP
    message: "Too many failed authentication attempts. Try again after 5 minutes.",
});

app.use("/api/auth", authLimiter); 
app.use("/api", generalLimiter); 


app.use(cors());

app.use(express.json()); 

app.use("/api", router);

app.use(errorHandlerMiddleware);

export default app;