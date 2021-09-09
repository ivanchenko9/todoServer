const http = require('http')
const url = require('url')

const confirmeAllTasks = () => {
    if(todosData.isCompletedAll){
         const newArray = todosData.todosAll.map(todo => ({
            ...todo,
            isCompleted: false
        }))
    } else {
        const newArray = todosData.todosAll.map(todo => ({
            ...todo,
            isCompleted: true
        }))
    }
    todosData.isCompletedAll = !todosData.isCompletedAll
}

const todosData = {
    todosAll: [],
    isCompletedAll: false
}

http.createServer( (request, response) => {
    console.log("Server is runnig...")

    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Headers', '*')
    
    if(request.method === 'OPTIONS') { //перед каждым POST & PUT запросами, браузер шлёт запрос с методом OPTIONS, что бы проверить, имеет ли он на это право
        response.setHeader('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        response.statusCode = 200
        return response.statusCode
        //return response.statusCode(200).json({})
    }
    

    switch(request.method){
        case 'GET':
            response.end(JSON.stringify(todosData))
        case 'POST':
            const urlRequest = url.parse(request.url, true)
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
                    response.end(newTodosAll)
                })
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
                    response.end(newTodosAll)
                })
            }
            else if (urlRequest.query.cleardone) {
                console.log('urlRequest.query.cleardone...')
                todosData.todosAll = todosData.todosAll.filter( todo => todo.isCompleted !== true)
                const newTodosAll = JSON.stringify(todosData.todosAll)
                response.end(newTodosAll)
            }
            else if (urlRequest.query.confirmall) {
                console.log('urlRequest.query.confirmall...')
                confirmeAllTasks()
                const newTodosData = JSON.stringify(todosData)
                response.end(newTodosData)
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
                    response.end(newTodosAll)
                })
            }
            

    }

//     if(request.method === 'GET')
//     {
//     let urlRequest = url.parse(request.url, true)
    
//     if (Number(urlRequest.query.test) === 200){
       
//     }
//     else{
//         response.end('Unknown test paametr!')
//     }
// } else if(request.method === 'POST'){
//     let body = ''

//     request.on('data', chunk => {
//         body += chunk.toString()
//     })

//     request.on('end', () => {
//         let parsedBody = parse(body)
//         console.log(parsedBody.title)
//         response.end('Body requested')
//     })
// }
    
}).listen(3000)