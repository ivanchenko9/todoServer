const http = require('http')
const url = require('url')
const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const connectionString = 'mongodb://127.0.0.1:27017/todos'

let db
const client = new MongoClient(connectionString)

const completeAllTasks = (dbTodoList, requestedStatus) => {
  if (requestedStatus === true) {
    dbTodoList.updateMany({}, { $set: { isCompleted: true } })
    return
  } else if (requestedStatus === false) {
    dbTodoList.updateMany({}, { $set: { isCompleted: false } })
    return
  }
}

function getDataFromDb(dbTodoList) {
  const newPromise = new Promise((resolve, reject) => {
    dbTodoList.find().toArray((err, items) => {
      const newDataList = items
      resolve(newDataList)
    })
  })

  const serverResponse = newPromise.then((responseData) => responseData)
  return serverResponse
}

async function sendDataToClient(dbTodoList, response, headers) {
  const rawData = await getDataFromDb(dbTodoList)
  console.log(rawData)
  response.writeHead(200, headers)
  response.end(JSON.stringify(rawData))
}

function getUserFomDB(dbUsersList, clientLogin) {
  const newPromise = new Promise((resolve, reject) => {
    dbUsersList.find({ login: clientLogin }).toArray((err, items) => {
      const newDataList = items
      resolve(newDataList)
    })
  })

  const serverResponse = newPromise.then((responseData) => responseData)
  return serverResponse
}

async function verifyRegistration(dbUsersList, response, headers, parsedBody) {
  const dbDataIsUserExist = await getUserFomDB(dbUsersList, parsedBody.login)
  console.log('Info from DB: ', dbDataIsUserExist)
  if (dbDataIsUserExist.length > 0) {
    response.writeHead(400, headers)
    const jsonResponceAnswer = JSON.stringify({
      message: 'User with this login is already exist!',
    })
    response.end(jsonResponceAnswer)
    return
  }
  if (parsedBody.login.length < 4 || parsedBody.login.length > 15) {
    response.writeHead(400, headers)
    const jsonResponceAnswer = JSON.stringify({
      message:
        'The login cannot consist of less then 4 symbols or more then 15',
    })
    response.end(jsonResponceAnswer)
    return
  }
  if (parsedBody.password.length < 4 || parsedBody.password.length > 20) {
    response.writeHead(400, headers)
    const jsonResponceAnswer = JSON.stringify({
      message:
        'The password cannot consist of less then 4 symbols or more then 20',
    })
    response.end(jsonResponceAnswer)
    return
  }

  const hashPassword = await bcrypt.hash(parsedBody.password, 9)

  dbUsersList.insertOne({
    id: parsedBody.id,
    login: parsedBody.login,
    password: hashPassword,
  })

  response.writeHead(200, headers)
  const jsonResponceAnswer = JSON.stringify({
    message: 'User was succesfuly added!',
  })

  response.end(jsonResponceAnswer)
}

client.connect(function (err, client) {
  db = client.db()
  const dbTodoList = db.collection('todosList')
  const dbUsersList = db.collection('usersList')

  http
    .createServer((request, response) => {
      console.log('Server is runnig...')
      const urlRequest = url.parse(request.url, true)

      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
        'Access-Control-Max-Age': 2592000,
      }

      if (request.method === 'OPTIONS') {
        response.writeHead(204, headers)
        response.end()
        return
      }

      if (request.method === 'GET' && urlRequest.pathname === '/') {
        try {
          sendDataToClient(dbTodoList, response, headers)
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      if (
        request.method === 'POST' &&
        urlRequest.pathname === '/registration'
      ) {
        try {
          let body = ''
          request.on('data', (chunk) => {
            body += chunk.toString()
          })
          request.on('end', () => {
            const parsedUserInfoToReg = JSON.parse(body)
            console.log('Parsed body: ', parsedUserInfoToReg)
            verifyRegistration(
              dbUsersList,
              response,
              headers,
              parsedUserInfoToReg,
            )
          })
          return
        } catch (e) {
          response.end({ message: e })
        }
      }

      if (request.method === 'POST' && urlRequest.pathname === '/todos') {
        try {
          let body = ''
          request.on('data', (chunk) => {
            body += chunk.toString()
          })
          request.on('end', () => {
            const parsedInternalTodo = JSON.parse(body)
            dbTodoList.insertOne({
              id: parsedInternalTodo.id,
              title: parsedInternalTodo.title,
              isCompleted: parsedInternalTodo.isCompleted,
            })
            sendDataToClient(dbTodoList, response, headers)
          })
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      if (
        request.method === 'POST' &&
        urlRequest.pathname === '/todos/update'
      ) {
        try {
          let body = ''
          request.on('data', (chunk) => {
            body += chunk.toString()
          })
          request.on('end', () => {
            const parsedUpdateforTodo = JSON.parse(body)
            dbTodoList.findOneAndUpdate(
              { id: Number(parsedUpdateforTodo.id) },
              { $set: { isCompleted: parsedUpdateforTodo.isCompleted } },
            )
            sendDataToClient(dbTodoList, response, headers)
          })
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      if (
        request.method === 'POST' &&
        urlRequest.pathname === '/todos/delete'
      ) {
        try {
          let body = ''
          request.on('data', (chunk) => {
            body += chunk.toString()
          })
          request.on('end', () => {
            const parsedDeleteforTodo = JSON.parse(body)
            dbTodoList.deleteOne({ id: parsedDeleteforTodo.id })
            sendDataToClient(dbTodoList, response, headers)
          })
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      if (
        request.method === 'POST' &&
        urlRequest.pathname === '/todos/cleardone'
      ) {
        try {
          dbTodoList.deleteMany({ isCompleted: true })
          sendDataToClient(dbTodoList, response, headers)
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      if (
        request.method === 'POST' &&
        urlRequest.pathname === '/todos/completeall'
      ) {
        try {
          let body = ''
          request.on('data', (chunk) => {
            body += chunk.toString()
          })
          request.on('end', () => {
            const parsedUpdateforTodo = JSON.parse(body)
            completeAllTasks(dbTodoList, parsedUpdateforTodo.isCompletedAll)
            sendDataToClient(dbTodoList, response, headers)
          })
          return
        } catch (e) {
          response.end({ message: e })
          return
        }
      }

      response.writeHead(404, headers)
      response.end(`This form is not allowed for the request.`)
    })
    .listen(3000)
})
