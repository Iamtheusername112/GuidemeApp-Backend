const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(403).json({ msg: "Not authorized, No token" });

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const token = req.headers.authorization.split(" ")[1]; //Remember, this is in the postman and in the request.headers.authorization, we started with Bearer and then space before the token, we are also able to apply split because the result there is an array and then [1] to basically get the first index
    //jwt to verify
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      //data here is = { id: user._id } which was generated firstly on the auth controller
      if (err) return res.status(403).json({ msg: "Wrong or expired token" });
      else {
        req.user = data; //data = { id: user._id }
        next();
      }
    });
  }
};

module.exports = verifyToken;
