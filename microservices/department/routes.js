// microservices/auth/routes/department.js
const controllers = require("./controllers");
const department = controllers.Department;
const { body } = require("express-validator");

const pre_path = `/api/v1/departments`;

// Validation rules
// cons = [
//   body("name")
//     .notEmpty()
//     .withMessage("Department name is required")
//     .isLength({ min: 2, max: 100 })
//     .withMessage("Department name must be between 2 and 100 characters"),
//   body("plant")
//     .notEmpty()
//     .withMessage("Plant name is required")
//     .isLength({ min: 2, max: 100 })
//     .withMessage("Plant name must be between 2 and 100 characters"),
// ];

module.exports = (app) => {
  // Get all departments
  app.get(`${pre_path}`, department.getAllDepartments);

  // Get single department
  app.get(`${pre_path}/:id`, department.getDepartment);

  // Create department
  app.post(`${pre_path}`, department.createDepartment);

  // Update department
  app.put(`${pre_path}/:id`, department.updateDepartment);

  // Delete department
  app.delete(`${pre_path}/:id`, department.deleteDepartment);
};
