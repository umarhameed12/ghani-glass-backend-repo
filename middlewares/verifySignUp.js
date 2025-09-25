const db = require("../models");
const User = db.User;

const checkDuplicateUser = async (req, res, next) => {
  try {
    // Check email
    if (req.body.email) {
      const emailUser = await User.findOne({
        where: { email: req.body.email },
      });
      if (emailUser) {
        return res.status(400).send({
          status: false,
          type: "error",
          message: "Failed! Email is already in use!",
        });
      }
    }

    // Check username
    if (req.body.username) {
      const usernameUser = await User.findOne({
        where: { username: req.body.username },
      });
      if (usernameUser) {
        return res.status(400).send({
          status: false,
          type: "error",
          message: "Failed! Username is already in use!",
        });
      }
    }

    // Check mobile
    // if (req.body.mobile) {
    //   const mobileUser = await User.findOne({
    //     where: { mobile: req.body.mobile },
    //   });
    //   if (mobileUser) {
    //     return res.status(400).send({
    //       status: false,
    //       type: "error",
    //       message: "Failed! Mobile number is already in use!",
    //     });
    //   }
    // }

    next();
  } catch (err) {
    res.status(500).send({
      status: false,
      type: "error",
      message: err.message,
    });
  }
};

module.exports = { checkDuplicateUser };
