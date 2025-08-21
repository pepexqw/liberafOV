const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

app.use(express.static(__dirname)); // Сервер статики для вашего проекта

let usersCount = 0;

io.on('connection', socket => {
    usersCount++;
    console.log(`Пользователь подключился. Всего ${usersCount}`);

    // Сообщаем всем новым количество пользователей
    io.emit('usersCount', usersCount);

    socket.on('join', () => {
        console.log('Пользователь присоединился');
    });

    socket.on('leave', () => {
        usersCount--;
        console.log(`Пользователь покинул комнату. Осталось ${usersCount}`);
        io.emit('usersCount', usersCount); // Оповещаем всех о новом количестве
    });

    socket.on('disconnect', () => {
        usersCount--;
        console.log(`Пользователь отключился. Осталось ${usersCount}`);
        io.emit('usersCount', usersCount); // Обновляем количество для всех
    });
});

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
