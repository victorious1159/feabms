import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import ChatContacts from '../components/chat/ChatContacts';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lấy thông tin người dùng hiện tại
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('http://localhost:8080/user/user_profile', { 
          credentials: 'include' 
        });
        
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin người dùng');
        }
        
        const data = await response.json();
        setCurrentUser(data.data || data); // Tùy thuộc vào cấu trúc response
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Header setOpen={setSidebarOpen} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          pt: 8, // Để không bị che bởi header
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <Grid container sx={{ height: 'calc(100% - 64px)' }}>
          {/* Danh sách liên hệ - Chiếm 30% ở màn hình lớn, 100% ở màn hình nhỏ */}
          <Grid 
            item 
            xs={12} 
            md={4} 
            lg={3} 
            sx={{ 
              display: { xs: selectedContact ? 'none' : 'block', md: 'block' },
              height: '100%' 
            }}
          >
            <Paper 
              sx={{ 
                height: '100%', 
                borderRadius: 0,
                overflow: 'hidden'
              }}
              elevation={1}
            >
              <ChatContacts 
                currentUser={currentUser}
                onSelectContact={handleSelectContact}
                selectedContactId={selectedContact?.userId}
              />
            </Paper>
          </Grid>
          
          {/* Cửa sổ chat - Chiếm 70% ở màn hình lớn, 100% ở màn hình nhỏ khi có người được chọn */}
          <Grid 
            item 
            xs={12} 
            md={8} 
            lg={9} 
            sx={{ 
              display: { xs: selectedContact ? 'block' : 'none', md: 'block' },
              height: '100%' 
            }}
          >
            <Paper 
              sx={{ 
                height: '100%', 
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
              elevation={1}
            >
              <ChatWindow 
                currentUser={currentUser}
                selectedContact={selectedContact}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ChatPage;