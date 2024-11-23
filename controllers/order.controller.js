const Order = require("../models/Order");
const Product = require("../models/Product");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipto, contact, orderList, totalPrice } = req.body;

    const insufficientStockItems = await productController.checkItemStock(
      orderList
    );

    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const order = new Order({
      userId,
      shipto,
      contact,
      items: orderList,
      totalPrice,
      orderNum: randomStringGenerator(),
    });
    await order.save();

    res.status(200).json({
      status: "success",
      orderNum: order.orderNum,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

orderController.getOrders = async (req, res) => {
  try {
    const { page, limit, sort } = req.query;
    const { userId } = req;

    let searchOrders = Order.find({ userId });

    if (page) {
      searchOrders = searchOrders.skip((page - 1) * limit).limit(limit);

      const total = Order.find({ userId }).countDocuments();
      const totalPages = Math.ceil(total / limit);

      response.totalCount = total;
      response.totalPageNum = totalPages;
    }

    const orders = await searchOrders.exec();

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        const updatedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findOne({
              _id: item.productId,
            });
            return {
              ...item.toObject(),
              product: {
                name: product?.name,
                image: product?.image,
              },
            };
          })
        );
        return {
          ...order.toObject(),
          items: updatedItems,
        };
      })
    );

    res.status(200).json({
      status: "success",
      orders: updatedOrders,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

orderController.getAdminOrders = async (req, res) => {
  try {
    const { page, ordernum, limit } = req.query;
    const cond = ordernum
      ? { orderNum: { $regex: ordernum, $options: "i" } }
      : {};
    let response = { status: "success" };

    let query = Order.find(cond)
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .sort({ createdAt: -1 });

    if (page) {
      query = query.skip((page - 1) * limit).limit(limit);

      const total = await Order.find(cond).countDocuments();
      const totalPages = Math.ceil(total / limit);

      response.totalCount = total;
      response.totalPageNum = totalPages;
    }

    const orders = await query.exec();

    response.orders = orders;

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await Order.findByIdAndUpdate(id, { status: status });

    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

module.exports = orderController;
