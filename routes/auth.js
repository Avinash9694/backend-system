import JWT from "jsonwebtoken";
//generate token if username and password is correct
const auth_token = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    //if token provided is incorrect or it token expires
    return res.status(400).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided",
    });
  }
};

export default auth_token;
