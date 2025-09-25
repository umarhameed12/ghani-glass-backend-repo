// microservices/auth/controllers/department.js
const { validationResult } = require("express-validator");
const db = require("../../../models");
const Category = db.Category;

module.exports = {
  // Get all departments
  async getAllCategories(req, res) {
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

      const { count, rows } = await Category.findAndCountAll({
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
      console.error("Get category error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Get single department
  async getCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      res.status(200).json({
        status: true,
        data: category,
      });
    } catch (error) {
      console.error("Get category error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Create department
  async createCategory(req, res) {
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
      const existingCategory = await Category.findOne({
        where: { name, plant },
      });

      if (existingCategory) {
        return res.status(400).json({
          status: false,
          message: "Category already exists in this plant",
        });
      }

      const category = await Category.create({
        name,
        plant,
      });

      res.status(201).json({
        status: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Update department
  async updateCategory(req, res) {
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

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      // Check if updated department already exists (excluding current one)
      const existingCategory = await Category.findOne({
        where: {
          name,
          plant,
          id: { [db.Sequelize.Op.ne]: id },
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          status: false,
          message: "Category already exists in this plant",
        });
      }

      await category.update({
        name,
        plant,
      });

      res.status(200).json({
        status: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      console.error("Update Category error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Delete department
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByPk(id);

      if (!category) {
        return res.status(404).json({
          status: false,
          message: "Category not found",
        });
      }

      await category.destroy();

      res.status(200).json({
        status: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      console.error("Delete Category error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },
};
