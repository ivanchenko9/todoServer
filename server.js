const http = require('http')
const url = require('url')
const {MongoClient} = require('mongodb')
const connectionString = "mongodb://127.0.0.1:27017/todos"

let db
const client = new MongoClient(connectionString)


const todosData = {
    isCompletedAll: false
}

const completeAllTasks = (dbTodoList) => {
    if(todosData.isCompletedAll === true){
        dbTodoList.updateMany(
            {},
            { $set: { isCompleted: false }})
            todosData.isCompletedAll = false
            return
    } else if(todosData.isCompletedAll === false){
        dbTodoList.updateMany(
            {},
            { $set: { isCompleted: true }})
            todosData.isCompletedAll = true
            return
    }
    //todosData.isCompletedAll = !todosData.isCompletedAll
    console.log(todosData.isCompletedAll)
}

function getDataFromDb(dbTodoList, response){
    const newPromise = new Promise( (resolve, reject) => {
        dbTodoList
        .find().toArray((err, items) => {
                const newTodoList = items
                resolve(newTodoList)
        })
    })
    newPromise.then(responseData => response.end(JSON.stringify(responseData)))
    .catch(error => console.log(error))
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
                response.writeHead(200, headers)
                getDataFromDb(dbTodoList, response)
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
                    response.writeHead(200, headers)
                    getDataFromDb(dbTodoList, response)
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
                    response.writeHead(200, headers)
                    getDataFromDb(dbTodoList, response)
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
                    response.writeHead(200, headers)
                    getDataFromDb(dbTodoList, response)
                })
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/cleardone'){
                dbTodoList.deleteMany({ isCompleted: true})
                response.writeHead(200, headers)
                getDataFromDb(dbTodoList, response)
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/completeall'){
                completeAllTasks(dbTodoList)
                response.writeHead(200, headers)
                getDataFromDb(dbTodoList, response)
                return
            }
    
            response.writeHead(405, headers)
            response.end(`This form is not allowed for the request.`)
        }).listen(3000)
    })

     
    
