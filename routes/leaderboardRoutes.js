const express = require("express")
const router = express.Router()
const {
  getLeaderboard,
  finishDay,
  finishWeek,
  giveRandomMoney,
} = require("../controllers/leaderboard/leaderboardController")

router.get("/", getLeaderboard)
router.post("/finishDay", finishDay)
router.post("/finishWeek", finishWeek)
router.post("/giveRandomMoney", giveRandomMoney)

module.exports = router