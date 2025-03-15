import React from "react";
import { Drawer, List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DescriptionIcon from "@mui/icons-material/Description";
import ReportIcon from "@mui/icons-material/Report";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import ChatIcon from "@mui/icons-material/Chat"; // Import icon chat

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Trang chủ", icon: <HomeIcon />, path: "/mainpage" },
    { text: "Hóa đơn", icon: <ReceiptIcon />, path: "/resident/invoices" },
    { text: "Đơn từ", icon: <DescriptionIcon />, path: "#" },
    { text: "Report", icon: <ReportIcon />, path: "#" },
    { text: "Thẻ chuyên dụng", icon: <CardMembershipIcon />, path: "#" },
    { text: "Trò chuyện", icon: <ChatIcon />, path: "/chat" } // Thêm menu chat
  ];

  return (
    <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
      <List sx={{ width: 250 }}>
        {menuItems.map((item, index) => (
          <ListItem 
            key={index}
            button 
            onClick={() => {
              navigate(item.path);
              setOpen(false);
            }}
            sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;