const { Strategy, ExtractJwt } = require('passport-jwt')

const config = require('./config')

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret,
}

function getUserFomDB(dbUsersList, userId) {
  const newPromise = new Promise((resolve, reject) => {
    dbUsersList.find({ id: userId }).toArray((err, items) => {
      const newDataList = items
      resolve(newDataList)
    })
  })

  const serverResponse = newPromise.then((responseData) => responseData)
  return serverResponse
}

module.exports = (passport, dbUsersList) => {
  passport.use(
    new Strategy(opts, async (payload, done) => {
      const user = await getUserFomDB(dbUsersList, payload.id)
      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    }),
  )
}
