// microservices/auth/controllers/assetStore.js
const { validationResult } = require("express-validator");
const db = require("../../../models");
const AssetStore = db.AssetStore;
const Department = db.Department;
const Category = db.Category;

module.exports = {
  // Get all asset stores
  async getAllAssetStores(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const departmentId = req.query.departmentId || "";
      const categoryId = req.query.categoryId || "";

      let whereClause = {};

      // Search functionality
      if (search) {
        whereClause[db.Sequelize.Op.or] = [
          { assetNo: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { assetTag: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { assetDescrition: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        ];
      }

      // Filter by department
      if (departmentId) {
        whereClause.departmentId = departmentId;
      }

      // Filter by category
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      const { count, rows } = await AssetStore.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name", "plant"],
            required: false,
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "plant"],
            required: false,
          },
        ],
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
      console.error("Get asset stores error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Get single asset store
  async getAssetStore(req, res) {
    try {
      const { id } = req.params;

      const assetStore = await AssetStore.findByPk(id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name", "plant"],
            required: false,
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "plant"],
            required: false,
          },
        ],
      });

      if (!assetStore) {
        return res.status(404).json({
          status: false,
          message: "Asset store not found",
        });
      }

      res.status(200).json({
        status: true,
        data: assetStore,
      });
    } catch (error) {
      console.error("Get asset store error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Create asset store
  // Create or update asset store
  async createAssetStore(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      const {
        assetNo,
        assetTag,
        assetDescrition,
        quantity,
        departmentId,
        categoryId,
      } = req.body;

      // Check if asset number already exists
      const existingAsset = await AssetStore.findOne({
        where: { assetNo },
      });

      // Verify department and category exist if provided
      if (departmentId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(400).json({
            status: false,
            message: "Department not found",
          });
        }
      }

      if (categoryId) {
        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            status: false,
            message: "Category not found",
          });
        }
      }

      let assetStore;
      let message;
      let statusCode;

      if (existingAsset) {
        // Update existing asset
        await existingAsset.update({
          assetTag,
          assetDescrition,
          quantity,
          departmentId: departmentId || null,
          categoryId: categoryId || null,
        });

        assetStore = existingAsset;
        message = "Asset store updated successfully";
        statusCode = 200;
      } else {
        // Create new asset
        assetStore = await AssetStore.create({
          assetNo,
          assetTag,
          assetDescrition,
          quantity,
          departmentId: departmentId || null,
          categoryId: categoryId || null,
        });

        message = "Asset store created successfully";
        statusCode = 201;
      }

      // Fetch the asset with department and category info
      const resultAsset = await AssetStore.findByPk(assetStore.id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name", "plant"],
            required: false,
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "plant"],
            required: false,
          },
        ],
      });

      res.status(statusCode).json({
        status: true,
        message,
        data: resultAsset,
        isUpdate: !!existingAsset, // This tells frontend if it was an update
      });
    } catch (error) {
      console.error("Create/Update asset store error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Update asset store
  async updateAssetStore(req, res) {
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
      const {
        assetNo,
        assetTag,
        assetDescrition,
        quantity,
        departmentId,
        categoryId,
      } = req.body;

      const assetStore = await AssetStore.findByPk(id);

      if (!assetStore) {
        return res.status(404).json({
          status: false,
          message: "Asset store not found",
        });
      }

      // Check if updated asset number already exists (excluding current one)
      if (assetNo !== assetStore.assetNo) {
        const existingAsset = await AssetStore.findOne({
          where: {
            assetNo,
            id: { [db.Sequelize.Op.ne]: id },
          },
        });

        if (existingAsset) {
          return res.status(400).json({
            status: false,
            message: "Asset number already exists",
          });
        }
      }

      // Verify department exists if provided
      if (departmentId || categoryId) {
        const department = await Department.findByPk(departmentId);
        if (!department) {
          return res.status(400).json({
            status: false,
            message: "Department not found",
          });
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
          return res.status(400).json({
            status: false,
            message: "Category not fount",
          });
        }
      }

      await assetStore.update({
        assetNo,
        assetTag,
        assetDescrition,
        quantity,
        departmentId: departmentId || null,
        categoryId: categoryId || null,
      });

      // Fetch the updated asset with department info
      const updatedAsset = await AssetStore.findByPk(id, {
        include: [
          {
            model: Department,
            as: "department",
            attributes: ["id", "name", "plant"],
            required: false,
          },
          {
            model: Category,
            as: "category",
            attributes: ["id", "name", "plant"],
            required: false,
          },
        ],
      });

      res.status(200).json({
        status: true,
        message: "Asset store updated successfully",
        data: updatedAsset,
      });
    } catch (error) {
      console.error("Update asset store error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  // Delete asset store
  async deleteAssetStore(req, res) {
    try {
      const { id } = req.params;

      const assetStore = await AssetStore.findByPk(id);

      if (!assetStore) {
        return res.status(404).json({
          status: false,
          message: "Asset store not found",
        });
      }

      await assetStore.destroy();

      res.status(200).json({
        status: true,
        message: "Asset store deleted successfully",
      });
    } catch (error) {
      console.error("Delete asset store error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },

  async bulkUploadAssetStores(req, res) {
    const transaction = await db.sequelize.transaction();

    try {
      const { assets, plant } = req.body;

      if (!assets || !Array.isArray(assets) || assets.length === 0) {
        return res.status(400).json({
          status: false,
          message: "No assets data provided",
        });
      }

      if (!plant) {
        return res.status(400).json({
          status: false,
          message: "Plant is required",
        });
      }

      // Get all departments and categories for the plant in one query
      const [departments, categories] = await Promise.all([
        Department.findAll({
          where: { plant },
          attributes: ["id", "name"],
          transaction,
        }),
        Category.findAll({
          where: { plant },
          attributes: ["id", "name"],
          transaction,
        }),
      ]);

      // Create lookup maps
      const departmentNameMap = new Map(
        departments.map((dept) => [dept.name.toLowerCase(), dept.id])
      );
      const categoryNameMap = new Map(
        categories.map((cat) => [cat.name.toLowerCase(), cat.id])
      );
      const departmentIdMap = new Map(
        departments.map((dept) => [dept.id, dept.id])
      );
      const categoryIdMap = new Map(categories.map((cat) => [cat.id, cat.id]));

      const result = {
        success: 0,
        failed: 0,
        errors: [],
        created: [],
        updated: [],
      };

      // Get all existing asset numbers in one query
      const existingAssets = await AssetStore.findAll({
        attributes: ["assetNo", "id"],
        transaction,
      });
      const existingAssetMap = new Map(
        existingAssets.map((asset) => [asset.assetNo, asset.id])
      );

      // Process all assets
      const assetsToCreate = [];
      const assetsToUpdate = [];

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        const rowNumber = i + 2;

        try {
          // Validate required fields
          if (
            !asset.assetNo ||
            !asset.assetDescrition ||
            asset.quantity == null
          ) {
            result.failed++;
            result.errors.push(`Row ${rowNumber}: Missing required fields`);
            continue;
          }

          // Find department ID
          let departmentId = null;
          if (asset.departmentId && !isNaN(Number(asset.departmentId))) {
            departmentId =
              departmentIdMap.get(Number(asset.departmentId)) || null;
            if (!departmentId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Department ID "${asset.departmentId}" not found`
              );
              continue;
            }
          } else if (asset.departmentName) {
            departmentId = departmentNameMap.get(
              asset.departmentName.toLowerCase()
            );
            if (!departmentId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Department "${asset.departmentName}" not found`
              );
              continue;
            }
          } else if (asset.departmentId && isNaN(Number(asset.departmentId))) {
            departmentId = departmentNameMap.get(
              asset.departmentId.toLowerCase()
            );
            if (!departmentId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Department "${asset.departmentId}" not found`
              );
              continue;
            }
          }

          // Find category ID
          let categoryId = null;
          if (asset.categoryId && !isNaN(Number(asset.categoryId))) {
            categoryId = categoryIdMap.get(Number(asset.categoryId)) || null;
            if (!categoryId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Category ID "${asset.categoryId}" not found`
              );
              continue;
            }
          } else if (asset.categoryName) {
            categoryId = categoryNameMap.get(asset.categoryName.toLowerCase());
            if (!categoryId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Category "${asset.categoryName}" not found`
              );
              continue;
            }
          } else if (asset.categoryId && isNaN(Number(asset.categoryId))) {
            categoryId = categoryNameMap.get(asset.categoryId.toLowerCase());
            if (!categoryId) {
              result.failed++;
              result.errors.push(
                `Row ${rowNumber}: Category "${asset.categoryId}" not found`
              );
              continue;
            }
          }

          const assetData = {
            assetNo: asset.assetNo.toString().trim(),
            assetTag: asset.assetTag ? asset.assetTag.toString().trim() : null,
            assetDescrition: asset.assetDescrition.toString().trim(),
            quantity: Number(asset.quantity),
            departmentId,
            categoryId,
          };

          // Check if asset exists
          const existingAssetId = existingAssetMap.get(assetData.assetNo);
          if (existingAssetId) {
            assetsToUpdate.push({ ...assetData, id: existingAssetId });
          } else {
            assetsToCreate.push(assetData);
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      // Bulk create new assets
      if (assetsToCreate.length > 0) {
        const createdAssets = await AssetStore.bulkCreate(assetsToCreate, {
          transaction,
          returning: true,
        });
        result.created = createdAssets;
        result.success += createdAssets.length;
      }

      // Bulk update existing assets
      if (assetsToUpdate.length > 0) {
        for (const assetUpdate of assetsToUpdate) {
          await AssetStore.update(assetUpdate, {
            where: { id: assetUpdate.id },
            transaction,
          });
        }
        result.updated = assetsToUpdate;
        result.success += assetsToUpdate.length;
      }

      await transaction.commit();

      res.status(200).json({
        status: true,
        message: `Bulk upload completed. Created: ${result.created.length}, Updated: ${result.updated.length}, Failed: ${result.failed}`,
        data: result,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Bulk upload error:", error);
      res.status(500).json({
        status: false,
        message: "Internal server error during bulk upload",
        error: error.message,
      });
    }
  },

  // Get asset statistics
  //   async getAssetStatistics(req, res) {
  //     try {
  //       const totalAssets = await AssetStore.count();

  //       const totalQuantity = (await AssetStore.sum("quantity")) || 0;

  //       const departmentStats = await AssetStore.findAll({
  //         attributes: [
  //           "departmentId",
  //           [db.sequelize.fn("COUNT", db.sequelize.col("id")), "assetCount"],
  //           [
  //             db.sequelize.fn("SUM", db.sequelize.col("quantity")),
  //             "totalQuantity",
  //           ],
  //         ],
  //         include: [
  //           {
  //             model: Department,
  //             as: "department",
  //             attributes: ["name", "plant"],
  //             required: false,
  //           },
  //         ],
  //         group: ["departmentId", "department.id"],
  //         raw: false,
  //       });

  //       res.status(200).json({
  //         status: true,
  //         data: {
  //           totalAssets,
  //           totalQuantity,
  //           departmentStats,
  //         },
  //       });
  //     } catch (error) {
  //       console.error("Get asset statistics error:", error);
  //       res.status(500).json({
  //         status: false,
  //         message: "Internal server error",
  //       });
  //     }
  //   },
};
