const Cart = require("../models/Cart");

const cartController = {};

cartController.createCart = async (req, res) => {
    try {
        const {userId} = req;
        const { cartItems } = req.body;

        let cart = await Cart.findOne({
            "userId": userId
        });

        if(!cart) {
            cart = new Cart({userId});
            await cart.save();
        }
        
        let falseCount = 0;
        const falseItems = [];
        const cartList = [];

        cartItems.forEach(async (item) => {
            const cartItem = cart.items.find(
                (cartItem) => cartItem.productId.equals(item.productId) && cartItem.size === item.size
            );

            if(cartItem) {
                falseCount++;
                falseItems.push(item.productId);
            }else{
                cart.items = [...cart.items, {productId: item.productId, size: item.size, qty: item.qty}];
                
                cartList.push(cart);
            }
            
        });

        if(falseCount > 0) {
            res.status(200).json({
                status: "fail",
                message: "Item already exists",
                falseItems
            });
        }else{
            for (const cart of cartList) {
                await cart.save();
            }
        }

        res.status(200).json({
            status: "success",
            cart,
            cartItemQty: cart.items.length
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message
        });
    }
}

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
            item.productId.equals(productId) ? {...item, qty, size} : item
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
