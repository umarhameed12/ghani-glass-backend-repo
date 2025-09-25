// microservices/auth/routes/department.js
const controllers = require("./controllers");
const category = controllers.Category;

const pre_path = `/api/v1/category`;

module.exports = (app) => {
  // Get all departments
  app.get(`${pre_path}`, category.getAllCategories);

  // Get single department
  app.get(`${pre_path}/:id`, category.getCategory);

  // Create department
  app.post(`${pre_path}`, category.createCategory);

  // Update department
  app.put(`${pre_path}/:id`, category.updateCategory);

  // Delete department
  app.delete(`${pre_path}/:id`, category.deleteCategory);
};
