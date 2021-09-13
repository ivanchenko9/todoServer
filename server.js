const http = require('http')
const url = require('url')

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


const todosData = {
    todosAll: [],
    isCompletedAll: false
}

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