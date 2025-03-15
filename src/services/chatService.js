import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class ChatService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.messageCallbacks = [];
    this.errorCallbacks = [];
    this.connectionCallbacks = [];
  }

  connect(userId) {
    if (this.connected) return;
    
    const socket = new SockJS('http://localhost:8080/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = null; // Tắt log debugging

    this.stompClient.connect(
      {},
      frame => {
        console.log('Connected: ' + frame);
        this.connected = true;
        
        // Đăng ký nhận tin nhắn cá nhân
        this.stompClient.subscribe(`/user/${userId}/queue/messages`, this.onMessageReceived);
        
        // Thông báo kết nối thành công
        this.connectionCallbacks.forEach(callback => callback(true));
      },
      error => {
        console.error('Lỗi kết nối: ' + error);
        this.connected = false;
        this.connectionCallbacks.forEach(callback => callback(false));
        this.errorCallbacks.forEach(callback => callback(error));
        
        // Thử kết nối lại sau 5 giây
        setTimeout(() => {
          this.connect(userId);
        }, 5000);
      }
    );
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected = false;
      console.log('Disconnected');
    }
  }

  sendMessage(senderId, receiverId, content) {
    if (!this.stompClient || !this.connected) {
      console.error('STOMP client chưa kết nối');
      return false;
    }

    const chatMessage = {
      senderId: senderId,
      receiverId: receiverId,
      content: content,
      timestamp: new Date()
    };

    this.stompClient.send("/app/chat.send", {}, JSON.stringify(chatMessage));
    return true;
  }

  onMessageReceived = (payload) => {
    const message = JSON.parse(payload.body);
    console.log('Tin nhắn mới:', message);
    
    // Thông báo tin nhắn mới cho các callback đăng ký
    this.messageCallbacks.forEach(callback => callback(message));
  }

  // Đăng ký callback nhận tin nhắn mới
  registerMessageCallback(callback) {
    this.messageCallbacks.push(callback);
  }

  // Đăng ký callback nhận thông báo lỗi
  registerErrorCallback(callback) {
    this.errorCallbacks.push(callback);
  }

  // Đăng ký callback nhận thông báo kết nối
  registerConnectionCallback(callback) {
    this.connectionCallbacks.push(callback);
  }

  // Hủy đăng ký callback
  unregisterMessageCallback(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
  }

  unregisterErrorCallback(callback) {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  unregisterConnectionCallback(callback) {
    this.connectionCallbacks = this.connectionCallbacks.filter(cb => cb !== callback);
  }

  // API để lấy lịch sử chat
  async getChatHistory(receiverId) {
    try {
      const response = await fetch(`http://localhost:8080/chat/history/${receiverId}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử chat:', error);
      throw error;
    }
  }

  // API để lấy danh sách liên hệ
  async getContacts() {
    try {
      const response = await fetch('http://localhost:8080/chat/contacts', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách liên hệ:', error);
      throw error;
    }
  }

  // API đánh dấu tin nhắn là đã đọc
  async markMessagesAsRead(userId) {
    try {
      const response = await fetch(`http://localhost:8080/chat/read/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi đánh dấu tin nhắn đã đọc:', error);
      return false;
    }
  }
}

// Tạo một instance duy nhất để sử dụng xuyên suốt ứng dụng
const chatService = new ChatService();
export default chatService;