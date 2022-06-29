const { faker } = require("@faker-js/faker")
const User = require("../models/userModel")

const generateRandomUsers = (amount) => {
  let users = []
  Array.from({ length: amount }).forEach(() => {
    users.push(createRandomUser());
  });
  return users
}

const createRandomUser = () => {
  return {
    name: faker.unique(faker.internet.userName),
    country: faker.address.countryCode()
  };
}

const randomMoney = (digits) => {
  return faker.datatype.number({ max: 10 ** digits })
}

// TODO: Clean This
const generateNewUserDB = (amount) => {
  User.deleteMany({}, (err) => {
    console.log("Delete Many")
    if (err) console.log(err)
    const users = generateRandomUsers(amount)
    console.log("Generate Users")
    User.insertMany(users, (err) => {
      if (err) console.log(err)
      console.log("Create Users")
      User.count({}, (err, count) => {
        if (err) console.log(err)
        console.log("Count", count)
      })
    })
  })
}

// generateNewUserDB(100000)

module.exports = {
  generateRandomUsers,
  createRandomUser,
  randomMoney
}