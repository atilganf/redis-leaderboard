const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const { randomMoney } = require("../../helpers/faker")
const RL = new RedisLeaderboard()

const giveRandomMoney = async () => {
  const users = await RL.getUsers(false)

  let prizePoolMoney = 0
  let userMoneyHash = {}
  
  for (let user of users) {
    const money = getDeduction(randomMoney(3), 2)
    userMoneyHash[user] = money.remaining
    prizePoolMoney += money.deduction
  }

  await Promise.all(users.map(user => {
    RL.increaseScore(user, userMoneyHash[user])
  }))

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

module.exports = giveRandomMoney