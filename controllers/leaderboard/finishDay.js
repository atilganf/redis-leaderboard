const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()

const finishDay = async () => {
  await RL.resetDailyRanks()

  return "success"
}

module.exports = finishDay