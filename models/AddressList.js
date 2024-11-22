const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    prefix: { type: String, required: true },
    middle: { type: String, required: true },
    last: { type: String, required: true },
  },
  { _id: false }
);

const AddressListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipto: { type: AddressSchema, required: true },
    contact: { type: ContactSchema, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressListSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

AddressListSchema.methods.setDefaultAddress = async function () {
  if (this.isDefault) {
    // 이 주소가 기본 배송지라면, 다른 모든 주소의 기본 배송지를 해제
    await AddressList.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
};

const AddressList = mongoose.model("AddressList", AddressListSchema);
module.exports = AddressList;
