import React, { useState, useEffect } from 'react';
import { Badge, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import chatService from '../../services/chatService';

// Component hiển thị icon chat với badge số lượng tin nhắn chưa đọc
const ChatNotificationBadge = ({ userId }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    // Hàm cập nhật số lượng tin nhắn chưa đọc
    const updateUnreadCount = async () => {
      try {
        const contacts = await chatService.getContacts();
        const totalUnread = contacts.reduce((sum, contact) => sum + (contact.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Lỗi khi lấy số tin nhắn chưa đọc:', error);
      }
    };

    // Cập nhật số lượng ban đầu
    updateUnreadCount();

    // Đăng ký lắng nghe tin nhắn mới
    const handleNewMessage = (message) => {
      if (message.receiverId === userId && !message.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };

    chatService.registerMessageCallback(handleNewMessage);

    return () => {
      chatService.unregisterMessageCallback(handleNewMessage);
    };
  }, [userId]);

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <IconButton color="inherit" onClick={handleClick}>
      <Badge badgeContent={unreadCount} color="error">
        <ChatIcon />
      </Badge>
    </IconButton>
  );
};

export default ChatNotificationBadge;