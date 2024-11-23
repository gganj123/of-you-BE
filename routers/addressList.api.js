const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const addressListController = require("../controllers/addressList.controller");

router.use(authController.authenticate);

router.post("/", addressListController.addAddress);
router.get("/", addressListController.getAddresses);
router.delete("/:addressId", addressListController.deleteAddress);
router.put("/:addressId", addressListController.updateAddress);
router.put("/:addressId/setDefault", addressListController.setDefaultAddress);

module.exports = router;
