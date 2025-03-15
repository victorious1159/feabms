import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Alert } from "@mui/material";
import axios from "axios";

function Login() {
    const [usernameOrEmail, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setError(null); // Xóa lỗi trước đó
        try {
            const response = await axios.post("http://localhost:8080/api/login", {
                usernameOrEmail,
                password
            }, { withCredentials: true });

            if (response.data.status === 200) {
                sessionStorage.setItem("loggedInUser", JSON.stringify(response.data.data));
                navigate("/mainpage");
            } else {
                setError("Tài khoản hoặc mật khẩu không đúng!");
            }
        } catch (error) {
            setError("Lỗi hệ thống hoặc thông tin đăng nhập sai!");
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 5, p: 3, boxShadow: 3, borderRadius: 2, textAlign: "center" }}>
                <Typography variant="h5" gutterBottom>Đăng nhập</Typography>

                {error && <Alert severity="error">{error}</Alert>}

                <TextField 
                    fullWidth
                    label="Tên đăng nhập hoặc Email" 
                    variant="outlined" 
                    margin="normal" 
                    value={usernameOrEmail} 
                    onChange={(e) => setUsername(e.target.value)} 
                />

                <TextField 
                    fullWidth
                    type="password" 
                    label="Mật khẩu" 
                    variant="outlined" 
                    margin="normal" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />

                <Button 
                    fullWidth 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={handleLogin}
                >
                    Đăng nhập
                </Button>
            </Box>
        </Container>
    );
}

export default Login;
