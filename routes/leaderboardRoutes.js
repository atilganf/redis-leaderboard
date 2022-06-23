const express = require("express")
const router = express.Router()
const {
  getLeaderboard,
  finishDay,
  finishWeek
} = require("../controllers/leaderboardController")

router.get("/", getLeaderboard)
router.post("/finishDay", finishDay)
router.post("/finishWeek", finishWeek)

module.exports = router