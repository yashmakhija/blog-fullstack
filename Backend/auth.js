const jwt = require("jsonwebtoken");
const JWT_SECRET = "s3cret";

function auth(req, res, next) {
  const token = req.headers.token;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(403).json({
      message: "You are not login user",
    });
  }
}

module.exports = {
  auth,
  JWT_SECRET,
};
