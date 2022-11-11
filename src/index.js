const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages.js')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // This is done behind in express library. Just explicitly writing it
const io = socketio(server)

const port = process.env.PORT || 3000 //process.env.PORT //npm i env-cmd --save-dev
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=> {
    console.log('New WebSocket connection!')

    socket.on('join', (options, callback) => {
        
        const {error, user} = addUser({ id: socket.id, ...options })

        if(error) {
            return callback(error)
        }
        socket.join(user.room) // join a chat room

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) //send message to everyone except ourself on the particular room.
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    })

    socket.on('sendMessage', (msg, callback)=> {
        const user = getUser(socket.id)
        if(user) {
            
            const filter = new Filter()
            
            if(filter.isProfane(msg)){
                return callback('Not Delivered. Bad language is not allowed')
            }
            io.to(user.room).emit('message', generateMessage(msg, user.username))
            callback('Delivered!')
        }
        else{
            callback('Error finding user')
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)

        if(user) {
            callback()
            io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`, user.username))
        }
        else{
            callback('Error finding user')
        }

    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port: ${port}!`)
})