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
  },
  total_money: {
    type: Number,
    default: 0
  },
  daily_rank: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model("User", userSchema)