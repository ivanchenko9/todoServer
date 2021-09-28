require('dotenv').config()

const Koa = require('koa')

const config = require('./lib/config')
const handlers = require('./handlers')
const controllers = require('./controllers')
const mongoConfig = require('./lib/mongo-congif')
const passport = require('koa-passport')
const passportConfig = require('./lib/passport-config')

const app = new Koa()

handlers.forEach((handler) => app.use(handler))
app.use(controllers.routes())
app.use(controllers.allowedMethods())
mongoConfig()

app.listen(config.port, () =>
  console.log(`Server has been started on the port ${config.port}`),
)
