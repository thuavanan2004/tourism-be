const jwt = require('jsonwebtoken');

module.exports.generateAccessToken = (userId) => {
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in the environment variables."
      );
    }

    const token = jwt.sign({
      userId
    }, secret, {
      expiresIn: '900s'
    })

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

module.exports.generateRefreshToken = (userId) => {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in the environment variables."
      );
    }

    const token = jwt.sign({
      userId
    }, secret, {
      expiresIn: '7d'
    })

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};