const express = require("express");
require("./db/mongoose"); //just for running the mongoose file
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();

app.use(express.json()); //JSON.parse all the incoming requests
app.use(userRouter);
app.use(taskRouter);

module.exports = app