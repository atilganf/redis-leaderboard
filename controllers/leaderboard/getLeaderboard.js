const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()
const colors = require("colors")

const getLeaderboard = async () => {
  const randomRank = await RL.getCount() / 2
  const randomUser = await RL.getUserFromRank(randomRank)
  // const randomUser = await RL.getRandomUser()
  const userRangeConfig = { top: 3, bottom: 2 }

  const [userRangeRedis, topUsersRedis, randomUserRank] = await Promise.all([
    getUserRange(randomUser, userRangeConfig),
    RL.getTop(),
    RL.getRank(randomUser),
  ])

  const [topUsers, userRange, prizepool, userCount] = await Promise.all([
    getUserData(topUsersRedis, 0),
    getUserData(userRangeRedis, randomUserRank - userRangeConfig.top),
    RL.getPrizePool(),
    RL.getCount()
  ])

  const leaderboardData = {
    user: randomUser,
    prizepool: prizepool,
    count: userCount,
    topUsers: topUsers,
    range: userRange,
  }

  return leaderboardData
}

const getUserData = async (redisArray, startRank) => {
  const names = getUserNames(redisArray)

  const [countries, dailyRanks] = await Promise.all([
    getCountries(names),
    RL.getDailyRanks(names)
  ])

  const namesAndScores = getScores(redisArray)

  usersHash = countries.reduce((obj, user) => {
    obj[user.name] = user.country;
    return obj;
  }, {})

  if (startRank < 0) startRank = 0
  const userData = namesAndScores.map((user, index) => {
    const rank = startRank + index
    return {
      ...user,
      country: usersHash[user.name],
      rank: rank,
      diff: dailyRanks[index] - rank
    }
  })

  return userData
}

const getUserNames = (redisArray) => {
  const usernames = redisArray.filter((el, index) => {
    return index % 2 === 0
  })
  return usernames
}

// @desc: returns name, country and daily_diff 
const getCountries = (namesArray) => {

  const countries = User.find(
    { "name": { $in: namesArray } },
    "name country -_id"
  )
  return countries
}

const getScores = (redisArray) => {
  const userScores = redisArray.map((el, index, array) => {
    if (index % 2 === 0) {
      return { name: el, score: array[index + 1] }
    }
  }).filter((el, index) => {
    return index % 2 === 0
  })
  return userScores
}

const getUserRange = async (username, range) => {
  const userRank = await RL.getRank(username)

  const [start, end] = [userRank - range.top, userRank + range.bottom]

  const userRange = await RL.getRange(start, end)

  return userRange
}

module.exports = getLeaderboard