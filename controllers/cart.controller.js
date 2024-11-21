const Cart = require("../models/Cart");

const cartController = {};

cartController.createCart = async (req, res) => {
  try {
    const { userId } = req;
    const { cartItems } = req.body;

    // 사용자 장바구니 가져오기
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const falseItems = []; // 중복된 상품
    const newItems = []; // 추가할 새로운 상품

    // cartItems 처리
    for (const item of cartItems) {
      const cartItemId = `${item.productId}_${item.size}`; // 고유 cartItemId 생성

      const isDuplicate = cart.items.some(
        (cartItem) => cartItem.cartItemId === cartItemId
      );

      if (isDuplicate) {
        falseItems.push(item.productId); // 중복된 상품 저장
      } else {
        newItems.push({
          ...item,
          cartItemId, // 고유 cartItemId 추가
        });
      }
    }

    // 중복된 상품이 있는 경우 바로 응답
    if (falseItems.length > 0) {
      return res.status(200).json({
        status: "fail",
        message: "Some items already exist in the cart.",
        falseItems,
      });
    }

    // 새로운 상품 추가
    cart.items.push(...newItems);
    await cart.save();

    // 성공 응답
    res.status(200).json({
      status: "success",
      message: "Cart updated successfully.",
      cart,
      cartItemQty: cart.items.length,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};


cartController.getCart = async (req, res) => {
    try {
        const {userId} = req;

        // populate = 참조하는 모델의 데이터를 가져오는 것
        const cart = await Cart.findOne({userId}).populate({
            path:"items",
            populate:{
                path:"productId",
                model:"Product",
            }
        });

        res.status(200).json({
            status: "success",
            data: cart.items
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
}

cartController.getCartCount = async (req, res) => {
    try {
        const {userId} = req;
        const cart = await Cart.findOne({userId});
        if(cart) {
            res.status(200).json({
                status: "success",
                count: cart.items.length
            });
        } else {
            res.status(200).json({
                status: "success",
                count: 0
            });
        }
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
}

cartController.deleteCartItem = async (req, res) => {
    try {
        const {itemId} = req.params;
        const {userId} = req;

        const cart = await Cart.findOne({userId});
        cart.items = cart.items.filter(item => !item._id.equals(itemId));
        await cart.save();

        res.status(200).json({
            status: "success",
            message: "Item deleted"
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
}

cartController.updateCartItem = async (req, res) => {
    try {
        const {userId} = req;
        const {productId, size, qty} = req.body;

        const cart = await Cart.findOne({userId});
        cart.items = cart.items.map(item =>
          item.cartItemId === `${productId}_${size}` ? {...item, qty} : item
        );
        await cart.save();

        res.status(200).json({
            status: "success",
            message: "Item updated",
            cart
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }

}

module.exports = cartController;
