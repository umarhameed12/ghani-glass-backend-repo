// models/AssetStore.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AssetStore extends Model {
    static associate(models) {
      // Define association with Department
      AssetStore.belongsTo(models.Department, {
        foreignKey: "departmentId",
        as: "department",
      });

      AssetStore.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
      });

      AssetStore.hasMany(models.Store_Transfers_Log, {
        foreignKey: "assetId",
        as: "store_transfer_log",
      });
    }
  }
  AssetStore.init(
    {
      assetNo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      assetTag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      assetDescrition: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Departments",
          key: "id",
        },
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "AssetStore",
    }
  );
  return AssetStore;
};
