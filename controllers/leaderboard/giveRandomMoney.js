const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const { randomMoney } = require("../../helpers/faker")
const RL = new RedisLeaderboard()

const giveRandomMoney = async () => {
  const users = await RL.getUsers(true)
  let scores = getScores(users)
  let names = getNames(users)

  let prizePoolMoney = 0
  
  scores = scores.map(score => {
    const money = getDeduction(randomMoney(3), 2)

    prizePoolMoney += money.deduction
    score = parseInt(score) + money.remaining
    return score
  })

  await RL.updateMultiple(names, scores)
  await RL.increasePrizePool(prizePoolMoney)

  return "success"
}

const getDeduction = (number, percent) => {
  const deduction = Math.round(number * percent / 100)
  const remaining = number - deduction

  return {
    remaining,
    deduction
  }
}


const getNames = (redisArray) => {
  const usernames = redisArray.filter((el, index) => {
    return index % 2 === 0
  })
  return usernames
}

const getScores = (redisArray) => {
  const scores = redisArray.filter((el, index) => {
    return index % 2 === 1
  })
  return scores
}

module.exports = giveRandomMoney