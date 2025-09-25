'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Store_Transfers_Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Store_Transfers_Log.belongsTo(models.AssetStore, {
        foreignKey: "assetId",
        as: "asset",
      });
    }
  }
  Store_Transfers_Log.init({
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "AssetStores",
          key: "id",
        },
      },
    transferFromPlant: DataTypes.STRING,
    tranferToPlant: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Store_Transfers_Log',
  });
  return Store_Transfers_Log;
};