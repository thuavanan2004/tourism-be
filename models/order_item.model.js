const {
  DataTypes
} = require('sequelize');
const sequelize = require('../config/database'); // Giả sử cấu hình Sequelize nằm trong thư mục config

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Order',
      key: 'id'
    }
  },
  tourDetailId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TourDetail',
      key: 'id'
    }
  },
  adultPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  adultQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  childrenPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  childrenQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  childPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  childQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  babyPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  babyQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  singleRoomSupplementPrice: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  singleRoomSupplementQuantity: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  note: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'order_item',
  timestamps: true
});

module.exports = OrderItem;