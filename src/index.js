const express = require("express");
const User = require("./models/user");
const Task = require("./models/task");
require("./db/mongoose"); //just for running the mongoose file
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT;

app.use(express.json()); //JSON.parse all the incoming requests
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () =>
    console.log("Server has started.................... on " + port)
);
