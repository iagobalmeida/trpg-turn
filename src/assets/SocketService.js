import { io } from 'socket.io-client';

class SocketioService {
  socket;
  constructor() {}

  setupSocketConnection() {
    this.socket = io('http://localhost:3000');
  }

  emit(eventName, data) {
    this.socket.emit(eventName, data);
  }

  bind(eventName, handler) {
    this.socket.on(eventName, handler);
  }
}

export default new SocketioService();