const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"]
  },
  country: {
    type: String,
    required: [true, "Please add a country"]
  },
  score: {
    type: Number,
    required: [true, "Please add a score"]
  },
  rank: {
    type: Number,
    required: [true, "Please add a rank"]
  },
})

module.exports = mongoose.model("User", userSchema)