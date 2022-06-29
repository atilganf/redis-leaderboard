const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()

const finishDay = async () => {
  await updateDailyRank()

  return "success"
}

const updateDailyRank = async () => {
  const names = await RL.getUsers(false)
  
  const nameRankHash = names.map((username, index) => {
    let hashObj = {}
    hashObj[username] = index
    return hashObj
  })

  await RL.setMultipleDailyRanks(nameRankHash)
}

module.exports = finishDay