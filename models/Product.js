const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    sku: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    image:{type:String, required: true},
    category: {type: Array, required: true},
    description: {type: String},
    price: {type: Number, required: true},
    salePrice: {type: Number},
    saleRate: {type: Number, default: 0},
    stock: {type: Object, required: true},
    brand: {type: String, required: true},
    status: {type: String, default: "active"},
    isDeleted: { type: Boolean, default: false }
},{
    timestamps: true
});

productSchema.methods.toJSON = function() {
    const obj = this._doc;
    delete obj.__v;
    delete obj.createdAt;
    delete obj.updatedAt;
    return obj;
}

const Product = mongoose.model("Product", productSchema);

module.exports = Product;