const Product = require("../models/Product");

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      brand,
      salePrice,
      realPrice,
      saleRate,
    } = req.body;

    const newProduct = new Product({
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      brand,
      salePrice,
      realPrice,
      saleRate,
    });

    await newProduct.save();

    return res.status(200).json({ status: "success", data: newProduct });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { mainCate, subCate, subCate2 } = req.params;
    const { page = 1, name, limit = 10, sort } = req.query;

    const decodedMainCate = decodeURIComponent(mainCate);
    const decodedSubCate = subCate ? decodeURIComponent(subCate) : null;
    const decodedSubCate2 = subCate2 ? decodeURIComponent(subCate2) : null;

    console.log('Received request with:', {
      mainCate: decodedMainCate,
      subCate: decodedSubCate,
      subCate2: decodedSubCate2,
      page,
      name,
      limit,
      sort,
    });

    const cond = {};

    if (name) {
      const keywords = name.split(" ").filter((word) => word.length > 0);
      cond.$or = keywords.map((keyword) => ({
        name: { $regex: keyword, $options: "i" },
      }));
    }

    if (decodedMainCate) {
      cond.category = { $all: [decodedMainCate] };
      if (decodedSubCate) cond.category.$all.push(decodedSubCate);
      if (decodedSubCate2) cond.category.$all.push(decodedSubCate2);
    }

    let query = Product.find(cond).skip((page - 1) * limit).limit(limit);

    if (sort === "highPrice") query = query.sort({ realPrice: -1 });
    if (sort === "lowPrice") query = query.sort({ realPrice: 1 });
    if (sort === "latest") query = query.sort({ createdAt: -1 });

    const products = await query.exec();
    const total = await Product.countDocuments(cond);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      products,
      page: parseInt(page),
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    res.status(500).json({ message: error.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      brand,
      salePrice,
    } = req.body;

    let saleRate = 0;

    if (salePrice) {
      saleRate = Number(((price - salePrice) / price) * 100).toFixed(1);
    }

    const product = await Product.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        sku,
        name,
        image,
        category,
        description,
        price,
        stock,
        brand,
        salePrice,
        saleRate,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      status: "success",
      product,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      status: "ok",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    res.status(200).json({
      status: "ok",
      product,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name} ${item.size} size is out of stock`,
    };
  } else {
    const newStock = { ...product.stock };
    newStock[item.size] -= item.qty;

    product.stock = newStock;

    return { isVerify: true, product };
  }
};

productController.checkItemStock = async (orderList) => {
  const result = [];
  let newProduct = [];

  // Promise.all 비동기 로직을 병렬로 처리
  await Promise.all(
    orderList.map(async (item) => {
      const checkStock = await productController.checkStock(item);
      if (!checkStock.isVerify) {
        result.push({ item, message: checkStock.message });
      } else {
        newProduct.push(checkStock.product);
      }
    })
  );

  if (result.length > 0) {
    return result;
  } else {
    newProduct.map(async (product) => {
      await product.save();
    });
  }

  return result;
};

module.exports = productController;
