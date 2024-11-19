const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const authController = require("../controllers/auth.controller");

router.post("/", 
    authController.authenticate, 
    cartController.createCart
);

router.get("/", 
    authController.authenticate, 
    cartController.getCart
);

router.get("/count", 
    authController.authenticate, 
    cartController.getCartCount
);

router.delete("/:itemId", 
    authController.authenticate, 
    cartController.deleteCartItem
);

router.put("/", 
    authController.authenticate, 
    cartController.updateCartItem
);

module.exports = router;