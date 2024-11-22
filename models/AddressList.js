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
    contact: { type: String, required: true },
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
    name: { type: String, required: true },
  },
  { timestamps: true }
);

AddressListSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

const AddressList = mongoose.model("AddressList", AddressListSchema);
module.exports = AddressList;
