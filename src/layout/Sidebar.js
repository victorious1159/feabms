import React from "react";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ open, setOpen }) => {
  const navigate = useNavigate();

  return (
    <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
      <List sx={{ width: 250 }}>
        <ListItem 
          button 
          onClick={() => navigate("/mainpage")}
          sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
        >
          <ListItemText primary="Trang chủ" />
        </ListItem>
        <ListItem 
          button 
          onClick={() => navigate("/resident/invoices")}
          sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
        >
          <ListItemText primary="Hóa đơn" />
        </ListItem>
        <ListItem 
          button
          sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
        >
          <ListItemText primary="Đơn từ" />
        </ListItem>
        <ListItem 
          button
          sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
        >
          <ListItemText primary="Report" />
        </ListItem>
        <ListItem 
          button
          sx={{ "&:hover": { backgroundColor: "#f0f0f0" } }}
        >
          <ListItemText primary="Thẻ chuyên dụng" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
