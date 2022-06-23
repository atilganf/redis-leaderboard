const Redis = require("ioredis")
const redis = new Redis()

class RedisLeaderboard {
  constructor(key = "leaderboard") {
    this.key = key
    this.prizePoolKey = `${key}-prizepool`
  }

  // User Functions
  async getUsers(withscores = false) {
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

  async getCount() {
    return await redis.zcard(this.key)
  }

  // Score and Rank Functions
  async getScore(username) {
    return await redis.zscore(this.key, username)
  }

  async increaseScore(username, increase) {
    await redis.zincrby(this.key, increase, username)
  }

  async getRank(username) {
    return await redis.zrevrank(this.key, username)
  }

  async getRankWithName(username) {
    const rank = await this.getRank(username)
    return [username, rank ]
  }

  async getTop(limit = 100) {
    return await this.getRange(0, limit - 1)
  }

  async getRange(start, end, withscores = false) {
    if (start < 0) start = 0
    if (end > this.getCount() - 1) end = this.getCount() - 1

    if (withscores) {
      return await redis.zrange(this.key, start, end, "WITHSCORES", "REV")
    } else {
      return await redis.zrange(this.key, start, end, "REV")
    }
  }

  // Prizepool Functions
  async getPrizePool() {
    return await redis.get(this.prizePoolKey)
  }

  async setPrizePool(amount) {
    await redis.set(this.prizePoolKey, amount)
  }

  async increasePrizePool(increase) {
    await redis.incrby(this.prizePoolKey, increase)
  }

  // async deleteDB(){
  //   await redis.
  // }
}



module.exports = RedisLeaderboard