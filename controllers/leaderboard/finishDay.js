const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()


const finishDay = async () => {
  await updateDailyRank()

  return "success"
}

const updateDailyRank = async () => {
  const names = await RL.getUsers(false)

  Promise.all(names.map(async (name) => {
    const rank = await RL.getRank(name)
    RL.setDailyRank(name, rank)
  }))
}

module.exports = finishDay