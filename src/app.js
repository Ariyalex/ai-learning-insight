const express = require("express");
const authRouter = require("./routes/AuthenticationsRoute");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(express.json());

app.use("/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found",
  });
});

app.use(errorHandler);

module.exports = app;
