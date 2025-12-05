const express = require("express");
const authRouter = require("./routes/AuthenticationsRoute");
const errorHandler = require("./middlewares/ErrorHandler");
const userRouter = require("./routes/UserRoute");
const insightRouter = require("./routes/InsightRoute");
const trackingtRouter = require("./routes/TrackingRoute");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost", "http://127.0.0.1:80", "http://0.0.0.0"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/insight", insightRouter);
app.use("/tracking", trackingtRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;
