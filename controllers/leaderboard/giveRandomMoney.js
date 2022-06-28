const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const { randomMoney } = require("../../helpers/faker")
const RL = new RedisLeaderboard()

const giveRandomMoney = async () => {
  const users = await RL.getUsers(false)

  await Promise.all(users.map(user => {
    const money = getDeduction(randomMoney(3), 2)

    RL.increasePrizePool(money.deduction)

    RL.increaseScore(user, money.remaining)
  }))

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