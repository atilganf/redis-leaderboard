const User = require("../../models/userModel")
const RedisLeaderboard = require("../../redis/RedisLeaderboard")
const RL = new RedisLeaderboard()

const getLeaderboard = async () => {
  // const randomUserName = await RL.getRandomUser()
  const randomUserName = "Lisandro_Daniel"
  const userRangeConfig = { top: 3, bottom: 2 }


  const [userRangeRedis, topUsersRedis, randomUser] = await Promise.all([
    getUserRange(randomUserName, userRangeConfig),
    RL.getTop(),
    RL.getRankWithName(randomUserName)
  ])

  const [topUsers, userRange, prizepool] = await Promise.all([
    getUserData(topUsersRedis, 0),
    getUserData(userRangeRedis, randomUser.rank - userRangeConfig.top),
    RL.getPrizePool()
  ])

  const leaderboardData = {
    user: randomUser,
    prizepool: prizepool,
    range: userRange,
    topUsers: topUsers
  }

  return leaderboardData
}

const getUserData = async (redisArray, startRank) => {
  const names = getUserNames(redisArray)
  const countries = await getCountries(names)
  const namesAndScores = getScores(redisArray)
  const dailyRanks = await RL.getDailyRanks()

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
      diff: rank - dailyRanks[user.name]
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
  return User.find(
    { "name": { $in: namesArray } },
    "name country -_id"
  )
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