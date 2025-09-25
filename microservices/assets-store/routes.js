// microservices/auth/routes/assetStore.js
const controllers = require("./controllers");
const assetStore = controllers.AssetStore;
// const { body } = require("express-validator");

const pre_path = `/api/v1/asset-stores`;

// // Validation rules
// const assetStoreValidation = [
//   body("assetNo")
//     .notEmpty()
//     .withMessage("Asset number is required")
//     .isLength({ min: 1, max: 50 })
//     .withMessage("Asset number must be between 1 and 50 characters"),
//   body("assetTag")
//     .optional()
//     .isLength({ max: 50 })
//     .withMessage("Asset tag must be less than 50 characters"),
//   body("assetDescrition")
//     .notEmpty()
//     .withMessage("Asset description is required")
//     .isLength({ min: 2, max: 500 })
//     .withMessage("Asset description must be between 2 and 500 characters"),
//   body("quantity")
//     .isInt({ min: 0 })
//     .withMessage("Quantity must be a positive integer"),
//   body("departmentId")
//     .optional()
//     .isInt()
//     .withMessage("Department ID must be a valid integer"),
//   body("categoryId")
//     .optional()
//     .isInt()
//     .withMessage("Category ID must be a valid integer"),
// ];

module.exports = (app) => {
  // Get all asset stores
  app.get(`${pre_path}`, assetStore.getAllAssetStores);

  // Get asset statistics
  //   app.get(`${pre_path}/statistics`, assetStore.getAssetStatistics);

  // Get single asset store
  app.get(`${pre_path}/:id`, assetStore.getAssetStore);

  // Create asset store
  app.post(`${pre_path}`, assetStore.createAssetStore);

  // Update asset store
  app.put(`${pre_path}/:id`, assetStore.updateAssetStore);

  // Delete asset store
  app.delete(`${pre_path}/:id`, assetStore.deleteAssetStore);
  app.post(`${pre_path}/bulk-upload`, assetStore.bulkUploadAssetStores);
};
