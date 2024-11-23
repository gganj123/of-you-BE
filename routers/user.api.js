const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authController = require("../controllers/auth.controller");

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);
router.delete('/delete', authController.authenticate, userController.deleteUser);

module.exports = router;
