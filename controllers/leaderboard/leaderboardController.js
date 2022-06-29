const User = require("../../models/userModel")
const asyncHandler = require("express-async-handler")
const { randomMoney } = require("../../helpers/faker")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")

const getLeaderboardData = require("./getLeaderboard")
const finishDayFunc = require("./finishDay")
const giveRandomMoneyFunc = require("./giveRandomMoney")
const finishWeekFunc = require("./finishWeek")
const RL = new RedisLeaderboard()


const getLeaderboard = asyncHandler(async (req, res) => {
  try {
    // await resetAndsetUsers()
    const leadData = await getLeaderboardData()
    res.json(leadData)

  } catch (error) {
    console.error(error)
    res.json({ error: error })
  }
})

const finishDay = asyncHandler(async (req, res) => {
  try {
    const result = await finishDayFunc()
    res.json(result)

  } catch (error) {
    console.error(error);
    res.json("error")
  }
})

const giveRandomMoney = asyncHandler(async (req, res) => {
  try {
    const result = await giveRandomMoneyFunc()
    res.json(result)

  } catch (error) {
    console.error(error);
    res.json("error")
  }
})

const finishWeek = asyncHandler(async (req, res) => {
  try {
    const result = await finishWeekFunc()
    res.json(result)

  } catch (error) {
    console.error(error);
    res.json("error")
  }
})

// setInterval(() => {
//   giveRandomMoneyFunc()
// }, 15000)


const resetAndsetUsers = async () => {
  await RL.deleteDB()
  await RL.resetPrizePool()
  await RL.resetDailyRanks()
  const users = await User.find({}, "name")

  Promise.all(users.map(async (user) => {
    await RL.addUser(user.name, randomMoney(5))
    const rank = await RL.getRank(user.name)
    RL.setDailyRank(user.name, rank)
  }))
}

module.exports = {
  getLeaderboard,
  finishDay,
  finishWeek,
  giveRandomMoney
}
