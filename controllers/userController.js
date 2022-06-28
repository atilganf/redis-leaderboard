const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const { generateRandomUsers } = require("../helpers/faker")

// @desc    Get Users
// @route   GET /api/users
// @access  Public
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find()

  res.status(200).json(users)
})

// @desc    Add User
// @route   SET /api/users
// @access  Public
const setUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body)

  res.status(201).json(user)
})

// @desc    Update User
// @route   PUT /api/users/:id
// @access  Public
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )

  res.status(200).json(updatedUser)
})

// @desc    Delete Users
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id, req.body)

  res.status(200).json(deletedUser)
})

const addRandomUsersToDB = async (amount) => {
  const users = generateRandomUsers(amount)
  await User.create(users)
}

const deleteAllUsers = () => {
  User.deleteMany({}, (err) => {
    if (err) console.error(err)
    else console.log("Removed all users")
  })
}

module.exports = {
  getUsers,
  setUser,
  updateUser,
  deleteUser
}