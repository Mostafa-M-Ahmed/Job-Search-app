import express from "express";
import path from "path";
import { config } from "dotenv";

import userRouter from "./src/modules/User/user.routes.js";
import companyRouter from "./src/modules/Company/company.routes.js";
import jobRouter from "./src/modules/Job/job.routes.js";
import { connection_db } from "./DB/connection.js";
import { globaleResponse } from "./src/Middlewares/error-handling.middleware.js";

const app = express();

// check the environment if it is dev or prod
if (process.env.NODE_ENV == "dev") {
  config({ path: path.resolve(".dev.env") });
}
if (process.env.NODE_ENV == "prod") {
  config({ path: path.resolve(".prod.env") });
}
config();

const port = process.env.PORT;

app.use(express.json());

app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/job", jobRouter);


app.use(globaleResponse);

connection_db();

app.get("/", (req, res) => res.send("Welcome to 'Job search app'"));
app.listen(port, () => console.log(`Job search app listening on port ${port}!`));
