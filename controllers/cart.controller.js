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
        const { userId } = req;

        // 사용자 카트와 연관된 제품 데이터 가져오기
        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId", // items 안에 있는 productId 참조
            model: "Product",
        });

        if (!cart) {
            return res.status(404).json({
                status: "fail",
                message: "Cart not found",
            });
        }

        // 필요한 데이터만 정제
        const cartItems = cart.items.map((item) => ({
            productId: {
                _id: item.productId._id,
                sku: item.productId.sku,
                name: item.productId.name,
                image: item.productId.image,
                category: item.productId.category,
                price: item.productId.price,
                salePrice: item.productId.salePrice,
                realPrice: item.productId.realPrice,
                saleRate: item.productId.saleRate,
                stock: item.productId.stock,
                brand: item.productId.brand,
                status: item.productId.status,
                isDeleted: item.productId.isDeleted,
                createdAt: item.productId.createdAt,
            },
            size: item.size,
            qty: item.qty,
            _id: item._id, // MongoDB에서 생성된 고유 ID
        }));

        res.status(200).json({
            status: "success",
            data: cartItems,
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

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
    const { cartItemId, size, qty } = req.body; // 요청 데이터에서 필요한 필드만 사용
    const { userId } = req;

    const cart = await Cart.findOne({ userId });

    const item = cart.items.find((item) => item._id.equals(cartItemId)); // `_id`로 찾기

    if (!item) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    // 요청 데이터에 따라 업데이트
    if (size) item.size = size; // 옵션 변경
    if (qty) item.qty = qty; // 수량 변경

    await cart.save();

    res.status(200).json({ message: 'Cart item updated.', cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



module.exports = cartController;
