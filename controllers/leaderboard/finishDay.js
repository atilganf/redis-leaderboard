const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()

const finishDay = async () => {
  await updateDailyRank()

  return "success"
}

const updateDailyRank = async () => {
  const names = await RL.getUsers(false)
  
  let namesRankHash = {}
  
  names.forEach((username, index) => {
    namesRankHash[username] = index
  })

  RL.setMultipleDailyRanks(namesRankHash)
}

module.exports = finishDay