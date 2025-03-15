import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatWindow = ({ currentUser, selectedContact }) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Kết nối WebSocket với URL đầy đủ
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: function(str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000
    });

    client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      setConnected(true);

      // Đăng ký nhận tin nhắn chung
      client.subscribe('/topic/public', (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, receivedMessage]);
      });
      
      // Nếu có user hiện tại, đăng ký kênh cá nhân
      if (currentUser && currentUser.userId) {
        client.subscribe(`/user/${currentUser.userId}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        });
      }
    };

    client.onStompError = (error) => {
      console.error('STOMP Error: ' + error);
      setConnected(false);
    };

    // Kích hoạt kết nối
    client.activate();
    setStompClient(client);

    // Cleanup khi unmount
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [currentUser]); // Chỉ kết nối lại khi currentUser thay đổi

  const handleSendMessage = () => {
    if (stompClient && inputMessage.trim() && connected && selectedContact) {
      const chatMessage = {
        senderId: currentUser?.userId,
        receiverId: selectedContact?.userId,
        content: inputMessage,
        timestamp: new Date()
      };

      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(chatMessage)
      });

      // Thêm tin nhắn vào UI
      setMessages(prev => [...prev, chatMessage]);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
        <Typography variant="h6">
          {selectedContact ? selectedContact.fullName || selectedContact.userName : 'Chat'}
        </Typography>
        <Typography variant="caption">
          {connected ? '🟢 Đã kết nối' : '🔴 Mất kết nối'}
        </Typography>
      </Paper>

      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto', bgcolor: '#f5f5f5' }}>
        {messages.map((msg, index) => (
          <Box 
            key={index} 
            sx={{ 
              mb: 1, 
              display: 'flex',
              justifyContent: currentUser?.userId === msg.senderId ? 'flex-end' : 'flex-start'
            }}
          >
            <Paper 
              sx={{ 
                p: 1, 
                maxWidth: '70%',
                bgcolor: currentUser?.userId === msg.senderId ? 'primary.main' : 'white',
                color: currentUser?.userId === msg.senderId ? 'white' : 'inherit'
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography color="text.secondary">
              {selectedContact 
                ? 'Không có tin nhắn. Hãy bắt đầu cuộc trò chuyện!' 
                : 'Chọn một người dùng để bắt đầu trò chuyện'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid #ddd' }}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            onKeyPress={handleKeyPress}
            disabled={!connected || !selectedContact}
            variant="outlined"
            size="small"
          />
          <Button 
            variant="contained"
            onClick={handleSendMessage}
            disabled={!connected || !inputMessage.trim() || !selectedContact}
            sx={{ ml: 1 }}
          >
            Gửi
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;