const http = require('http')
const url = require('url')
const {MongoClient} = require('mongodb')
const connectionString = "mongodb://127.0.0.1:27017/todos"
// /todos под вопросом
let db
const client = new MongoClient(connectionString)


const todosData = {
    todosAll: [],
    isCompletedAll: false
}

const completeAllTasks = () => {
    let newArray
    if(todosData.isCompletedAll){
        newArray = todosData.todosAll.map(todo => ({
            ...todo,
            isCompleted: false
        }))
    } else {
        newArray = todosData.todosAll.map(todo => ({
            ...todo,
            isCompleted: true
        }))
    }
    todosData.isCompletedAll = !todosData.isCompletedAll
    return newArray
}

function getDataFromDB(){
    let newTodosAll, newIsCompletedAll = false;
      const result = db.collection('todosList')
      .find().toArray((err, items) => {
          newTodosAll = items
      })
      
      db.collection('isCompletedAll')
      .find()
      .toArray(function (err, items) {
      newIsCompletedAll = items[0].isCompletedAll
      })

      console.log(newTodosAll, newIsCompletedAll)

    return [newTodosAll, newIsCompletedAll]
}


//db.todosList.insertOne({"_id":1, "title":"todo", "isConfirmed":false})

 //   db.collection('todosList')
    //   .find()
    //   .toArray(function (err, items) {
    //   todosData.todosAll = items
    //   })
    //   db.collection('isCompletedAll')
    //   .find()
    //   .toArray(function (err, items) {
    //   todosData.isCompletedAll = items.isCompletedAll
    //   })


        
    //   const result = db.collection('todosList')
    //   .find().toArray((err, items) => {
    //       console.log(items)
    //   })
    //   console.log(result)
      
    //   db.collection('isCompletedAll')
    //   .find()
    //   .toArray(function (err, items) {
    //   todosData.isCompletedAll = items
    //   })
        
    client.connect(
    function (err, client) {
      db = client.db()
      db.collection('todosList')
            .find().toArray((err, items) => {
                    todosData.todosAll = items
            })
      db.collection('isCompletedAll')
            .find().toArray((err, items) => {
                    todosData.isCompletedAll = items[0].isCompletedAll
            })
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
                response.end(JSON.stringify(todosData))
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos'){
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedInternalTodo = JSON.parse(body)
                    todosData.todosAll.push(parsedInternalTodo)
                    db.collection('todosList').insertOne({ id: parsedInternalTodo.id , title: parsedInternalTodo.title, isCompleted: parsedInternalTodo.isCompleted})
                    const newTodosAll = JSON.stringify(todosData.todosAll)
                    response.writeHead(200, headers)
                    response.end(newTodosAll)
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
                    
                    todosData.todosAll = todosData.todosAll.map( todo => {
                        if(todo.id === Number(parsedUpdateforTodo.id)){
                            db.collection('todosList').findOneAndUpdate(
                                { id: Number(parsedUpdateforTodo.id) },
                                { $set: { isCompleted: !todo.isCompleted }})
                            return {
                                ...todo,
                                        isCompleted: !todo.isCompleted
                                }
                            }
                            else {
                                    return todo
                                }
                            })
    
                    const newTodosAll = JSON.stringify(todosData.todosAll)
                    response.writeHead(200, headers)
                    response.end(newTodosAll)
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
                    todosData.todosAll = todosData.todosAll.filter(todo => todo.id !== parsedDeleteforTodo.id)
                    const newTodosAll = JSON.stringify(todosData.todosAll)
                    response.writeHead(200, headers)
                    response.end(newTodosAll)
                })
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/cleardone'){
                todosData.todosAll = todosData.todosAll.filter( todo => todo.isCompleted !== true)
                const newTodosAll = JSON.stringify(todosData.todosAll)
                response.writeHead(200, headers)
                response.end(newTodosAll)
                return
            }
    
            if(request.method === 'POST' && urlRequest.pathname === '/todos/completeall'){
                todosData.todosAll = completeAllTasks()
                const newTodosData = JSON.stringify(todosData)
                response.writeHead(200, headers)
                response.end(newTodosData)
                return
            }
    
            response.writeHead(405, headers)
            response.end(`${request.method} is not allowed for the request.`)
        }).listen(3000)
    })

     
    
