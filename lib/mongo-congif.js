const { MongoClient } = require('mongodb')
const config = require('./config')

const initCMongoConnect = () => {
  const client = new MongoClient(config.mongoUri)
  let db

  client.connect(function (err, client) {
    db = client.db()
  })

  const dbTodoList = db.collection('todosList')
  const dbUsersList = db.collection('usersList')

  return { dbTodoList, dbUsersList }
}

module.exports = initCMongoConnect
