import { authService } from './auth.service';
import { notificationService } from './notification.service';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        this.socket = new WebSocket(`ws://localhost:5000?token=${token}`);

        this.socket.onopen = () => {
            console.log('WebSocket Connected');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket Disconnected');
            this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'NOTIFICATION':
                notificationService.handleNewNotification(data.payload);
                break;
            case 'EXAM_RESULT':
                this.notifyListeners('examResult', data.payload);
                break;
            case 'GRADE_UPDATE':
                this.notifyListeners('gradeUpdate', data.payload);
                break;
            case 'USER_STATUS':
                this.notifyListeners('userStatus', data.payload);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            return;
        }

        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    sendMessage(type, payload) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ type, payload }));
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const webSocketService = new WebSocketService();