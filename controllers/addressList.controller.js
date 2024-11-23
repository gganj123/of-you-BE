const AddressList = require("../models/AddressList");

const addressListController = {};

addressListController.addAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { shipto, contact } = req.body;

    const newAddress = new AddressList({ userId, shipto, contact });
    await newAddress.save();
    return res.status(200).json({ status: "success", data: newAddress });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

addressListController.getAddresses = async (req, res) => {
  try {
    const { userId } = req;
    const addresses = await AddressList.find({ userId });
    return res.status(200).json({
      status: "success",
      count: addresses.length,
      data: addresses,
      message:
        addresses.length > 0
          ? "Address list fetched successfully."
          : "No addresses found.",
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

addressListController.deleteAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.params;

    const deleteAddress = await AddressList.deleteOne({
      _id: addressId,
      userId,
    });
    if (deleteAddress.deletedCount > 0) {
      return res.status(200).json({
        status: "success",
        message: "The address has been successfully deleted.",
      });
    } else {
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found." });
    }
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

addressListController.updateAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.params;
    const { shipto, contact } = req.body;

    const existingAddress = await AddressList.findOne({
      _id: addressId,
      userId,
    });
    if (!existingAddress) {
      return res
        .status(404)
        .json({ status: "fail", message: "Address not found." });
    }

    const updateAddress = await AddressList.findOneAndUpdate(
      { _id: addressId, userId },
      {
        $set: {
          "shipto.address": shipto.address,
          "shipto.city": shipto.city,
          "shipto.zip": shipto.zip,
          "contact.firstName": contact.firstName,
          "contact.lastName": contact.lastName,
          "contact.contact": contact.contact,
        },
      },
      { new: true }
    );

    if (updateAddress) {
      return res.status(200).json({
        status: "success",
        message: "Address updated successfully.",
        data: updateAddress,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Address not found or no changes made.",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

addressListController.setDefaultAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.params;

    // 먼저 모든 주소의 isDefault를 false로 설정
    await AddressList.updateMany({ userId }, { $set: { isDefault: false } });

    // 선택한 주소를 기본 배송지로 설정
    const updatedAddress = await AddressList.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (updatedAddress) {
      return res.status(200).json({
        status: "success",
        message: "Default address set successfully.",
        data: updatedAddress,
      });
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Address not found.",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = addressListController;
