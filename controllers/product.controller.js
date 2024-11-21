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
    const { page, name, limit, sort } = req.query;

    const cond = {};

    if (name) {
      // 띄어쓰기로 단어를 분리하고 빈 문자열 제거
      const keywords = name.split(" ").filter((word) => word.length > 0);

      if (keywords.length > 1) {
        // 여러 단어가 있는 경우 AND 검색
        cond.$and = keywords.map((keyword) => {
          let searchTerms = [keyword];

          // 남성/남자, 여성/여자 동의어 처리
          if (keyword === "남자") searchTerms.push("남성");
          if (keyword === "여자") searchTerms.push("여성");
          if (keyword === "바지") searchTerms.push("팬츠");

          return {
            $or: searchTerms.flatMap((term) => [
              { name: { $regex: term, $options: "i" } },
              { category: { $regex: term, $options: "i" } },
            ]),
          };
        });
      } else {
        // 단일 단어인 경우 OR 검색
        let searchTerms = [keywords[0]];

        // 남성/남자, 여성/여자 동의어 처리
        if (keywords[0] === "남자") searchTerms.push("남성");
        if (keywords[0] === "여자") searchTerms.push("여성");
        if (keywords[0] === "바지") searchTerms.push("팬츠");

        cond.$or = searchTerms.flatMap((term) => [
          { name: { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
        ]);
      }
    }

    if (mainCate) {
      cond.category = { $all: [mainCate] };
      if (subCate) {
        cond.category = { $all: [mainCate, subCate] };
        if (subCate2) {
          cond.category = { $all: [mainCate, subCate, subCate2] };
        }
      }
    }

    let query = Product.find(cond);
    let response = { status: "ok" };

    if (page) {
      query = query.skip((page - 1) * limit).limit(limit);

      if (sort === "highPrice") {
        query = query.sort({ realPrice: -1 });
      } else if (sort === "lowPrice") {
        query = query.sort({ realPrice: 1 });
      } else if (sort === "highSale") {
        query = query.sort({ saleRate: -1 });
      } else if (sort === "lowSale") {
        query = query.sort({ saleRate: 1 });
      } else if (sort === "latest") {
        query = query.sort({ createdAt: -1 });
      } else if (sort === "oldest") {
        query = query.sort({ createdAt: 1 });
      }

      const total = await Product.find(cond).countDocuments();
      const totalPages = Math.ceil(total / limit);

      response.page = page;
      response.totalCount = total;
      response.totalPageNum = totalPages;
    }

    const products = await query.exec();

    response.products = products;

    res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
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
