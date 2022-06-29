const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()


const finishWeek = async () => {
  await RL.setPrizePool(10000000)
  
  await distrubutePrizePool()

  await resetLeaderboard()
}

const distrubutePrizePool = async () => {
  const users = await RL.getUsers(false)

  const prizeHash = await createNamePrizeHash(users)

  const bulkOperations = users.map(user => {
    return {
      updateOne: {
        filter: { name: user },
        update: { $inc: { total_money: prizeHash[user] } }
      }
    }
  })

  await User.bulkWrite(bulkOperations)
  
  return "success"
}

const createNamePrizeHash = async (users) => {
  const pool = await RL.getPrizePool()

  const hash = {}
  hash[users[0].name] = getPercentage(pool, 20)
  hash[users[0].name] = getPercentage(pool, 15)
  hash[users[0].name] = getPercentage(pool, 10)

  const userCount = users.length - 3
  const remainingPrize = getPercentage(pool, 55)
  const avgPrize = Math.round(remainingPrize / userCount)
  const prizeRatio = 10

  users.forEach((user, index) => {
    const perc = getLinearPercentage(userCount, index - 3, prizeRatio)
    const userPrize = getPercentage(avgPrize, perc)
    hash[user] = userPrize
  })

  return hash
}

const getLinearPercentage = (userCount, rank, ratio) => {
  let startPerc = 200 / (ratio + 1); // the percentage last user getting

  let unit = (200 - (2 * startPerc)) / (userCount - 1)

  let perc = startPerc + (unit * (userCount - 1 - rank)) // index must start from 0

  return perc;
}

const getPercentage = (number, perc) => {
  return Math.round(number * perc / 100)
}

const resetLeaderboard = async () => {
  await RL.setPrizePool(0)
  await RL.resetScores()
  await RL.resetDailyRanks()
}

module.exports = finishWeek