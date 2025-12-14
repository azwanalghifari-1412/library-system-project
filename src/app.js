import express from "express";
import cors from "cors"; 
import router from "./routes/index.js";

import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/api", router);

app.use(errorHandlerMiddleware);

export default app;