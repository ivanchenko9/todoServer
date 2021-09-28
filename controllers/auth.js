const Router = require('koa-router')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwevtoken')
const mongoConfig = require('../lib/mongo-congif')

const config = require('../lib/config')

const router = new Router().prefix('/auth')

function getUserFomDB(dbUsersList, login) {
  const newPromise = new Promise((resolve, reject) => {
    dbUsersList.find({ login: login }).toArray((err, items) => {
      const newDataList = items
      resolve(newDataList)
    })
  })

  const serverResponse = newPromise.then((responseData) => responseData)
  return serverResponse
}

const { todoList, usersList } = mongoConfig()

router.post('/registration', async (ctx) => {
  const { login, password } = ctx.request.body
  const user = await getUserFomDB(usersList, login)
  if (user) {
    ctx.throw(400, 'User already exist')
  }
})

router.post('/login', async (ctx) => {})

module.exports = router.routes()
