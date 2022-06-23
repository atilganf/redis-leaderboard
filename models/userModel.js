const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true
  },
  country: {
    type: String,
    required: [true, "Please add a country"]
  }
})

module.exports = mongoose.model("User", userSchema)