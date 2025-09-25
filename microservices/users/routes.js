const controllers = require("./controllers");
const User = controllers.User;

const pre_path = `/api/v1/users`;

module.exports = (app) => {
  app.get(`${pre_path}`, User.getUsers);
};
