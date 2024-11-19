const Like = require("../models/Like");

const likeController = {};

likeController.toggleLike = async (req, res) => {
  try {
    const { userId } = req;
    const { productId } = req.params;

    const likeRecord = await Like.findOne({ userId, productId });
    if (likeRecord) {
      await Like.findByIdAndDelete(likeRecord._id);
      return res.status(200).json({
        status: "success",
        data: likeRecord,
        message: "Like removed successfully",
      });
    } else {
      const newLike = new Like({ userId, productId });
      await newLike.save();
      return res.status(200).json({
        status: "success",
        data: newLike,
        message: "Like added successfully",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

likeController.getLikeList = async (req, res) => {
  try {
    const { userId } = req;
    const likeList = await Like.find({ userId }).populate("productId");
    return res.status(200).json({
      status: "success",
      data: likeList,
      message:
        likeList.length > 0
          ? "Like list fetched successfully"
          : "No likes found",
    });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = likeController;
