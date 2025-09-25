const app = require("./server");
const proxy = require("express-http-proxy");
require("dotenv").config();

require("./microservices/auth/routes")(app);
require("./microservices/department/routes")(app);
require("./microservices/assets-store/routes")(app);
require("./microservices/category/routes")(app);
require("./microservices/users/routes")(app);

app.listen(8000, () => {
  console.log(`Gateway is listening to 8000`);
});

module.exports = app;
