import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Badge,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import chatService from '../../services/chatService';

const ChatContacts = ({ currentUser, onSelectContact, selectedContactId }) => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy danh sách liên hệ khi component mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Tạm thời sử dụng API người dùng để lấy danh sách liên hệ
        const response = await fetch('http://localhost:8080/user/user_list', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Lỗi khi lấy danh sách liên hệ');
        }
        
        const data = await response.json();
        
        // Lọc bỏ người dùng hiện tại
        const contactsList = data.data.filter(user => 
          currentUser && user.userId !== currentUser.userId
        ).map(user => ({
          ...user,
          unreadCount: 0 // Ban đầu không có tin nhắn chưa đọc
        }));
        
        setContacts(contactsList);
        setFilteredContacts(contactsList);
        setLoading(false);
      } catch (err) {
        console.error('Lỗi:', err);
        setError('Không thể tải danh sách liên hệ');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);

  // Lọc danh sách liên hệ khi người dùng tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          contact => 
            (contact.fullName && contact.fullName.toLowerCase().includes(query)) || 
            (contact.userName && contact.userName.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, contacts]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleContactSelect = (contact) => {
    onSelectContact(contact);
  };

  // Xử lý khi nhận được tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (message) => {
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.userId === message.senderId && selectedContactId !== message.senderId) {
            // Tăng số tin nhắn chưa đọc nếu tin nhắn đến từ người khác không phải là người đang chat
            return { ...contact, unreadCount: (contact.unreadCount || 0) + 1 };
          }
          return contact;
        });
      });
    };

    chatService.registerMessageCallback(handleNewMessage);

    return () => {
      chatService.unregisterMessageCallback(handleNewMessage);
    };
  }, [selectedContactId]);

  // Xóa đếm tin nhắn chưa đọc khi chọn liên hệ
  useEffect(() => {
    if (selectedContactId) {
      setContacts(prevContacts => {
        return prevContacts.map(contact => {
          if (contact.userId === selectedContactId) {
            return { ...contact, unreadCount: 0 };
          }
          return contact;
        });
      });
    }
  }, [selectedContactId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Trò chuyện
        </Typography>
        <TextField
          fullWidth
          placeholder="Tìm kiếm người dùng..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      </Box>
      <Divider />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List>
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ListItem
                key={contact.userId}
                button
                selected={selectedContactId === contact.userId}
                onClick={() => handleContactSelect(contact)}
                sx={{
                  bgcolor: selectedContactId === contact.userId ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={contact.unreadCount}
                    color="primary"
                    invisible={!contact.unreadCount}
                  >
                    <Avatar src={contact.userImgUrl}>
                      {!contact.userImgUrl && contact.fullName ? contact.fullName.charAt(0) : <PersonIcon />}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={contact.fullName || contact.userName}
                  secondary={
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '180px',
                      }}
                    >
                      {contact.role || 'Người dùng'}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="Không tìm thấy người dùng"
                secondary={searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Không có người dùng nào"}
              />
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
};

export default ChatContacts;