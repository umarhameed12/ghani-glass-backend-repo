// microservices/auth/controllers/department.js
const { validationResult } = require("express-validator");
const db = require("../../../models");
const Department = db.Department;

module.exports = {
  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const whereClause = search
        ? {
            [db.Sequelize.Op.or]: [
              { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
              { plant: { [db.Sequelize.Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const { count, rows } = await Department.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        status: true,
        data: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error("Get departments error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Get single department
  async getDepartment(req, res) {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({
          status: false,
          message: "Department not found",
        });
      }

      res.status(200).json({
        status: true,
        data: department,
      });
    } catch (error) {
      console.error("Get department error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Create department
  async createDepartment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { name, plant } = req.body;

      // Check if department already exists
      const existingDepartment = await Department.findOne({
        where: { name, plant },
      });

      if (existingDepartment) {
        return res.status(400).json({
          status: false,
          message: "Department already exists in this plant",
        });
      }

      const department = await Department.create({
        name,
        plant,
      });

      res.status(201).json({
        status: true,
        message: "Department created successfully",
        data: department,
      });
    } catch (error) {
      console.error("Create department error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Update department
  async updateDepartment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { name, plant } = req.body;

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({
          status: false,
          message: "Department not found",
        });
      }

      // Check if updated department already exists (excluding current one)
      const existingDepartment = await Department.findOne({
        where: {
          name,
          plant,
          id: { [db.Sequelize.Op.ne]: id },
        },
      });

      if (existingDepartment) {
        return res.status(400).json({
          status: false,
          message: "Department already exists in this plant",
        });
      }

      await department.update({
        name,
        plant,
      });

      res.status(200).json({
        status: true,
        message: "Department updated successfully",
        data: department,
      });
    } catch (error) {
      console.error("Update department error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Delete department
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      const department = await Department.findByPk(id);

      if (!department) {
        return res.status(404).json({
          status: false,
          message: "Department not found",
        });
      }

      await department.destroy();

      res.status(200).json({
        status: true,
        message: "Department deleted successfully",
      });
    } catch (error) {
      console.error("Delete department error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },
};
