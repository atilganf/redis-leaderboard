const getUserData = async (redisArray, startRank) => {
  const names = getUserNames(redisArray)
  const countries = await getCountriesAndRanks(names)
  const namesAndScores = getScoresWithNames(redisArray)

  usersHash = countries.reduce((obj, user) => {
    obj[user.name] = {
      country: user.country,
      daily_rank: user.daily_rank
    };
    return obj;
  }, {})

  if (startRank < 0) startRank = 0
  const userData = namesAndScores.map((user, index) => {
    const rank = startRank + index
    return {
      ...user,
      country: usersHash[user.name].country,
      rank: rank,
      diff: rank - usersHash[user.name].daily_rank
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
const getCountriesAndRanks = (namesArray) => {
  return User.find(
    { "name": { $in: namesArray } },
    "name country daily_rank -_id"
  )
}

const getScoresWithNames = (redisArray) => {
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

const finishDay = asyncHandler(async (req, res) => {
  // Basic
  await giveRandomMoney() // Redisdeki herkese %2 deduction ile money vericez
  console.time("updateRank")
  updateDailyRank()
  console.timeEnd("updateRank")

  const leadData = await getLeaderboardFunc()
  res.json(leadData)

})

// Redisdeki herkese %2 deduction ile money vericez
const giveRandomMoney = async () => {
  const users = await RL.getUsers(false)

  await Promise.all(users.map(user => {
    const money = getDeduction(randomMoney(3), 2)

    RL.increasePrizePool(money.deduction)

    RL.increaseScore(user, money.remaining)
  }))
}

const getDeduction = (number, percent) => {
  const deduction = Math.round(number * percent / 100)
  const remaining = number - deduction

  return {
    remaining,
    deduction
  }
}

const updateDailyRank = async () => {
  const redisNames = await RL.getUsers(false)

  redisNames.forEach((name, index) => {
    User.findOneAndUpdate({ name: name }, { daily_rank: index })
  })
}