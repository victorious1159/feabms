import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications"; // Import icon chuông
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/authApi"; // Import hàm logout từ auth api

const Header = () => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/user/profile");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: "deepskyblue" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}></Typography>

          {/* Icon Home */}
          <IconButton color="inherit">
            <HomeIcon />
          </IconButton>

          {/* Icon chuông thông báo */}
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>

          {/* Icon tài khoản */}
          <IconButton color="inherit" onMouseEnter={handleMenuOpen}>
            <AccountCircleIcon />
          </IconButton>

          {/* Menu dropdown tài khoản */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onMouseLeave={handleMenuClose}
          >
            <MenuItem disabled>[Tên]</MenuItem>
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Đổi mật khẩu</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar open={open} setOpen={setOpen} />
    </>
  );
};

export default Header;
