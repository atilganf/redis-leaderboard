const Redis = require("ioredis")
const redis = new Redis()

class RedisLeaderboard {
  constructor(key = "leaderboard") {
    this.key = key // Sorted Set
    this.dailyRankKey = `${key}-dailyrank` // Hash
    this.prizePoolKey = `${key}-prizepool` // Normal Key Value
  }

  // User Methods
  async getUsers(withscores = true) {
    return await this.getRange(0, -1, withscores)
  }

  async getRandomUser() {
    return await redis.zrandmember(this.key)
  }

  async addUser(username, score) {
    await redis.zadd(this.key, score, username)
  }

  async addIfNotExist(username, score) {
    const isExist = await this.isUserExist(username)
    if (!isExist) {
      await this.addUser(username, score)
    }
  }

  async deleteUser(username) {
    await redis.zrem(this.key, username)
  }

  async isUserExist(username) {
    const isExist = await this.getScore(username) ? true : false
    return isExist
  }

  getCount() {
    return redis.zcard(this.key)
  }

  // Score and Rank Methods
  async getScore(username) {
    return await redis.zscore(this.key, username)
  }

  async increaseScore(username, increase) {
    await redis.zincrby(this.key, increase, username)
  }

  async updateMultiple(names, scores) {
    let scoreNameArray = []
    names.forEach((username, index) => {
      scoreNameArray.push(scores[index])
      scoreNameArray.push(username)
    })
    await redis.zadd(this.key, "XX", scoreNameArray)
  }

  async getRank(username) {
    return redis.zrevrank(this.key, username)
  }

  async getRankWithName(username) {
    const rank = await this.getRank(username)
    return { name: username, rank: rank }
  }

  async getTop(limit = 100, withscores = true) {
    return await this.getRange(0, limit - 1, withscores)
  }

  async getRange(start, end, withscores = true) {
    if (start < 0) start = 0
    if (end > this.getCount() - 1) end = this.getCount() - 1

    if (withscores) {
      return await redis.zrange(this.key, start, end, "WITHSCORES", "REV")
    } else {
      return await redis.zrange(this.key, start, end, "REV")
    }
  }

  // Prizepool Methods
  async getPrizePool() {
    return await redis.get(this.prizePoolKey)
  }

  async setPrizePool(amount) {
    await redis.set(this.prizePoolKey, amount)
  }

  async increasePrizePool(increase) {
    await redis.incrby(this.prizePoolKey, increase)
  }

  // DailyRank Methods
  async getAllDailyRanks() {
    return redis.hgetall(this.dailyRankKey)
  }

  async getDailyRanks(nameArray) {
    return redis.hmget(this.dailyRankKey, nameArray)
  }

  async setDailyRank(username, daily_rank) {
    const rankObj = {}
    rankObj[username] = daily_rank
    redis.hset(this.dailyRankKey, rankObj)
  }

  async setMultipleDailyRanks(nameRankHash){
    redis.hset(this.dailyRankKey, nameRankHash).then((err, res) => console.log(err, res))
  }

  // DB functions
  async resetPrizePool() {
    redis.set(this.prizePoolKey, 0)
  }

  async resetDailyRanks() {
    const names = await this.getUsers(false)

    Promise.all(names.map(async (name) => {
      const rank = await this.getRank(name)
      this.setDailyRank(name, rank)
    }))
  }

  async resetScores() {
    redis.zunionstore(this.key, 1, this.key, "WEIGHTS", 0)
  }

  async deleteDB() {
    await redis.del(this.key)
  }
}



module.exports = RedisLeaderboard