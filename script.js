// Импортируем библиотеку socket.io-client
import io from 'https://cdn.socket.io/socket.io-4.5.4.min.js';

// Создаем глобальную переменную для хранения нашего RTCPeerConnection
let peerConnection = null;

// Элемент для отображения статуса комнаты
const roomStatus = document.getElementById('roomStatus');

// Подключаемся к нашему серверу сигнализаций
const socket = io('http://localhost:3000'); // Укажите адрес вашего сервера

// Обработчик события получения числа пользователей от сервера
socket.on('usersCount', count => {
    document.querySelector('#usersCount').innerText = `${count} Пользователей в чате`;
});

// Функция присоединения к общей комнате
async function joinRoom() {
    try {
        // Настраиваем конфигурацию для RTCPeerConnection
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnection = new RTCPeerConnection(configuration);

        // Запрашиваем доступ к микрофону пользователя
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Добавляем потоки медиаданных к нашей Peer Connection
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // Обрабатываем входящие аудиотреки
        peerConnection.ontrack = event => {
            if (event.track.kind === 'audio') {
                const player = document.createElement('audio');
                player.srcObject = event.streams[0];
                player.controls = true;
                player.autoplay = true;
                document.getElementById('audioPlayers').appendChild(player);
            }
        };

        // Генерация предложения подключения (Offer)
        async function createOffer() {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            // Передача Offer другому участнику (реализуется дополнительно через сервер сигнализаций)
            console.log('Отправлено предложение:', offer.sdp);
        }

        // Генерируем предложение подключения
        createOffer();

        // Обновляем статус комнаты
        roomStatus.textContent = 'Вы подключились к голосовому чату!';
    } catch (err) {
        console.error(err);
        alert("Ошибка подключения!");
    }
}

// Обработка кандидатов ICE
peerConnection.onicecandidate = event => {
    if (event.candidate) {
        console.log('Получили ICE-кандидат:', event.candidate);
    }
};

// Сообщаем серверу о присоединении и выходе
socket.on('connect', () => {
    console.log('Подключён к серверу');
    socket.emit('join');
});

socket.on('disconnect', () => {
    console.log('Отключён от сервера');
    socket.emit('leave');
});

// Очистка ресурсов при закрытии окна браузера
window.onbeforeunload = () => {
    if (peerConnection && peerConnection.connectionState !== 'closed') {
        peerConnection.close();
    }
};
