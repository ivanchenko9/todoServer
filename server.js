const http = require('http')
const url = require('url')
const {MongoClient} = require('mongodb')
const connectionString = "mongodb://127.0.0.1:27017/todos"

let db
const client = new MongoClient(connectionString)

const completeAllTasks = (dbTodoList, requestedStatus) => {
    if(requestedStatus === true){
        dbTodoList.updateMany(
            {},
            { $set: { isCompleted: true }})
            return
    } else if(requestedStatus === false){
        dbTodoList.updateMany(
            {},
            { $set: { isCompleted: false }})
            return
    }
}

 function getDataFromDb(dbTodoList){
    const newPromise = new Promise( (resolve, reject) => {
        dbTodoList
        .find().toArray((err, items) => {
                const newTodoList = items
                resolve(newTodoList)
        })
    })

    const serverResponse = newPromise.then(responseData => responseData)
    return serverResponse
}

async function sendDataToClient(dbTodoList, response, headers){
    const rawData = await getDataFromDb(dbTodoList)
    console.log(rawData)
    response.writeHead(200, headers)
    response.end(JSON.stringify(rawData))
} 
    client.connect(
    function (err, client) {
      db = client.db()
      const dbTodoList = db.collection('todosList')
   
        http.createServer( (request, response) => {
            console.log("Server is runnig...")
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
    
            if(request.method === 'GET' && urlRequest.pathname === '/'){
                sendDataToClient(dbTodoList, response, headers)
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos'){
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedInternalTodo = JSON.parse(body)
                    dbTodoList.insertOne({ id: parsedInternalTodo.id , title: parsedInternalTodo.title, isCompleted: parsedInternalTodo.isCompleted})
                    sendDataToClient(dbTodoList, response, headers)
                })
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/update'){
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedUpdateforTodo = JSON.parse(body)
                    dbTodoList.findOneAndUpdate(
                        { id: Number(parsedUpdateforTodo.id) },
                        { $set: { isCompleted: parsedUpdateforTodo.isCompleted}})
                    sendDataToClient(dbTodoList, response, headers)
                })
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/delete'){
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedDeleteforTodo = JSON.parse(body)
                    dbTodoList.deleteOne({ id: parsedDeleteforTodo.id})
                    sendDataToClient(dbTodoList, response, headers)
                })
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/cleardone'){
                dbTodoList.deleteMany({ isCompleted: true})
                sendDataToClient(dbTodoList, response, headers)
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/completeall'){
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
            }
    
            response.writeHead(404, headers)
            response.end(`This form is not allowed for the request.`)
        }).listen(3000)
    })

     
    
