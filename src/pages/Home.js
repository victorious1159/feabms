import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Box } from "@mui/material";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container sx={{ textAlign: "center", marginTop: 5 }}>
      <Typography variant="h4" gutterBottom>Chào mừng đến hệ thống quản lý hóa đơn</Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/login")}>
          Đăng nhập dành cho khách
        </Button>
        <Button variant="contained" color="secondary" onClick={() => navigate("/manage_landing_page")}>
          Đăng nhập dành cho staff
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
