// Глобальные переменные
let peerConnection = null;
const audioPlayers = document.getElementById('audioPlayers');
const roomStatus = document.getElementById('roomStatus');

async function joinRoom() {
    try {
        // Создаем RTCPeerConnection для обмена медиа-данными
        const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        peerConnection = new RTCPeerConnection(configuration);
        
        // Получаем микрофон пользователя
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Добавляем поток своего голоса к соединению
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
        
        // Обработка входящих треков
        peerConnection.ontrack = event => {
            if (event.track.kind === 'audio') {
                const player = document.createElement('audio');
                player.srcObject = event.streams[0];
                player.controls = true;
                player.autoplay = true;
                audioPlayers.appendChild(player);
            }
        };
        
        // Отправляем предложение другим пользователям присоединиться
        createOffer();
        
        roomStatus.textContent = 'Вы подключены!';
    } catch (err) {
        console.error(err);
        alert("Ошибка подключения");
    }
}

// Генерируем offer (предложение соединения)
async function createOffer() {
    try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        // Здесь должна происходить отправка предложения другим участникам чата,
        // например, через сервер сигнализаций типа Socket.io или Firebase Realtime Database
        
        console.log('Предложение создано:', offer.sdp);
    } catch (err) {
        console.error(err);
    }
}

// Для примера обработчик события приема предложения от другого участника
peerConnection.onicecandidate = event => {
    if (event.candidate) {
        // Обрабатываем кандидата ICE для завершения установления связи
        console.log('ICE кандидат:', event.candidate);
    }
};

// Если сессия закрыта, очищаем ресурсы
window.onbeforeunload = () => {
    if (peerConnection && peerConnection.connectionState !== 'closed') {
        peerConnection.close();
    }
};
