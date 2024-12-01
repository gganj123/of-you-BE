const mongoose = require("mongoose");
const Cart = require("./Cart");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipto: { type: Object, required: true },
    contact: { type: Object, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["preparing", "shipping", "delivered", "cancelled"],
      default: "preparing",
    },
    orderNum: { type: String },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: { type: String, required: true },
        qty: { type: Number },
        price: { type: Number, required: true }, // 결재 당시 가격
      },
    ],
  },
  {
    timestamps: true,
  }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
