const http = require('http')
const url = require('url')

const confirmeAllTasks = () => {
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


const todosData = {
    todosAll: [],
    isCompletedAll: false
}

http.createServer( (request, response) => {
    console.log("Server is runnig...")
    

    response.setHeader('Access-Control-Allow-Origin', '*')
    //response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-type, Accept, BMTVS-Domain-Origin')
    response.setHeader('Access-Control-Allow-Headers', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    
    if (request.method === 'OPTIONS'){
        response.statusCode = 204
        response.end()
    }
    const urlRequest = url.parse(request.url, true)
    console.log(urlRequest)
    switch(request.method){
        case 'GET':
            console.log('GET')
            //response.statusCode = 200
            response.end(JSON.stringify(todosData))
            break
        case 'POST':
            
            if (urlRequest.query.delete){
                console.log('urlRequest.query.delete...')
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedDeleteforTodo = JSON.parse(body)
                    todosData.todosAll = todosData.todosAll.filter(todo => todo.id !== parsedDeleteforTodo.id)
                    const newTodosAll = JSON.stringify(todosData.todosAll)
                    //response.statusCode = 200
                    response.end(newTodosAll)
                    
                })
                break
            }
            else if (urlRequest.query.update) {
                console.log('urlRequest.query.update...')
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedUpdateforTodo = JSON.parse(body)
                    todosData.todosAll = todosData.todosAll.map( todo => {
                        if(todo.id === Number(parsedUpdateforTodo.id)){
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
                    //response.statusCode = 200
                    response.end(newTodosAll)
                    
                })
                break
            }
            else if (urlRequest.query.cleardone) {
                console.log('urlRequest.query.cleardone...')
                todosData.todosAll = todosData.todosAll.filter( todo => todo.isCompleted !== true)
                const newTodosAll = JSON.stringify(todosData.todosAll)
                //response.statusCode = 200
                response.end(newTodosAll)
                break
            }
            else if (urlRequest.query.completeall) {
                console.log('urlRequest.query.completeall...')
                todosData.todosAll = confirmeAllTasks()
                const newTodosData = JSON.stringify(todosData)
                response.statusCode = 200
                response.end(newTodosData)
                break
            }
            else
            {
                console.log('POST...')
                let body = ''
                request.on('data', (chunk) => {
                    body += chunk.toString()
                })
                request.on('end', () => {
                    const parsedInternalTodo = JSON.parse(body)
                    todosData.todosAll.push(parsedInternalTodo)
                    const newTodosAll = JSON.stringify(todosData.todosAll)
                    //response.statusCode = 200
                    response.end(newTodosAll)
                })
                break
            }
    }
}).listen(3000)