const passport = require('koa-passport')
const passportConfig = require('../lib/passport-config')
const mongoConfig = require('../lib/mongo-congif')

passportConfig(passport, mongoConfig().dbUsersList)

module.exports = passport.initialize()
