import React from "react";
import { Button, Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ResidentPage = () => {
    const username = sessionStorage.getItem("loggedInUser") || "bạn";
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/auth/logout"); // Nếu backend có API logout
        } catch (error) {
            console.error("Lỗi khi logout:", error);
        }
        
        sessionStorage.removeItem("loggedInUser"); // Xóa session
        navigate("/login"); // Chuyển hướng về login
    };

    const handleViewInvoices = () => {
        navigate("/resident/invoices"); // Chuyển hướng đến danh sách hóa đơn
    };

    return (
        <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100vh" 
            bgcolor="#f5f5f5"
        >
            <Card sx={{ width: 400, p: 3, textAlign: "center", boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Xin chào, {username}!
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                        Chào mừng bạn đến với trang cư dân.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        sx={{ mb: 2 }}
                        onClick={handleViewInvoices}
                    >
                        Xem hóa đơn của bạn
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        fullWidth
                        onClick={handleLogout}
                    >
                        Đăng xuất
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ResidentPage;
