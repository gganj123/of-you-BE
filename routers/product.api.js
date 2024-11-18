const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const authController = require("../controllers/auth.controller");


router.get("/", 
    productController.getProducts
);

router.get("/category/:mainCate", 
    productController.getProducts
);

router.get("/category/:mainCate/:subCate", 
    productController.getProducts
);

router.get("/category/:mainCate/:subCate/:subCate2", 
    productController.getProducts
);

router.post("/", 
    authController.authenticate,
    authController.checkAdminPermission,
    productController.createProduct
);

router.put("/:id", 
    authController.authenticate,
    authController.checkAdminPermission,
    productController.updateProduct
);

router.delete("/:id", 
    authController.authenticate,
    authController.checkAdminPermission,
    productController.deleteProduct
);

router.get("/:id",
    productController.getProductById
);

module.exports = router;
