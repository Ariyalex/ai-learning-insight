const { verifyAccessToken } = require("../tokenize/TokenManager");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId };
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};
