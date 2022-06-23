const User = require("../models/userModel")
const asyncHandler = require("express-async-handler")
const { randomScore } = require("../helpers/faker")
const RedisLeaderboard = require("../redis/RedisLeaderboard")

const getLeaderboard = asyncHandler(async (req, res) => {
  const randomUser = await RL.getRandomUser()
  let topUsers = await RL.getTop()
  let userRange = await getUserRange(randomUser)

  res.json({
    user: randomUser,
    range: userRange,
    topUsers: topUsers
  })
})

const finishDay = asyncHandler(async (req, res) => {

})

const RL = new RedisLeaderboard()

const setUsers = async () => {
  const users = await User.find({}, "name score")

  users.forEach((user) => {
    RL.addIfNotExist(user.name, randomScore(5))
  })
}

const getUserRange = async (username) => {
  const userRank = await RL.getRank(username)

  let [start, end] = [userRank - 3, userRank + 2]

  const userRange = await RL.getRange(start, end)

  return userRange
}


const finishWeek = asyncHandler(async (req, res) => {
  res.json("Finish Week")
})

module.exports = {
  getLeaderboard,
  finishDay,
  finishWeek
}
