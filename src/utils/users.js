var users = []

const addUser = ({ id, username, room }) => {
    
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room) {
        return {
            error: 'User name and room are required.'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    if(existingUser) {
       return {
        error: 'Username already exists'
       } 
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = ((id) => {
    const index = users.findIndex((user)=> {
        return user.id == id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0] // return first element of an array of 1 item at index=index
    }
})

const getUser = (id) => {
    return users.find((user)=> {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    return users.filter((user)=> {
        return user.room === room.trim().toLowerCase()
    })
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}