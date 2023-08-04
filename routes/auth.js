import JWT from "jsonwebtoken";

const auth_token = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided",
    });
  }
};

export default auth_token;
