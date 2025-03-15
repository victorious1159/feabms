import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Grid,
    Button,
    TextField,
    Select,
    MenuItem,
    Tabs,
    Tab,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton
} from "@mui/material";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        description: "",
        phone: "",
        userImgUrl: "",
        age: "",
        birthday: "",
        idNumber: "",
        job: ""
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleOpenDialog = () => setOpenDialog(true);
    const handleCloseDialog = () => setOpenDialog(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: name === "birthday" ? new Date(value).toISOString().split("T")[0] : value,
        });
    };

    const handleCloseImageModal = () => setImageModalOpen(false);

    // Xử lý khi chọn ảnh mới

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedFile(file);
            setSelectedImage(imageUrl);
        }
    };

    useEffect(() => {
        fetch("http://localhost:8080/notification/view_all", {
            method: "GET",
            credentials: "include", // Gửi cookie cùng request
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setNotifications(data);
            })
            .catch((error) => {
                console.error("Lỗi khi lấy thông báo:", error);
            });
    }, []);

    const handleNotificationClick = (noti) => {
        if (noti.notificationType === "1") {
            navigate('/resident/invoices');  // Navigate to the desired path
        }
    };

    const handleUploadImage = () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        fetch("http://localhost:8080/user/update_image", {
            method: "PUT",
            credentials: "include",
            body: formData,
        })
            .then(res => res.json().catch(() => res.text())) // Xử lý cả JSON lẫn text
            .then(data => {
                const message = typeof data === "string" ? data : data.message;
                alert(message || "Cập nhật ảnh thành công!");
                setUser(prev => ({ ...prev, userImgUrl: selectedImage }));
                setSelectedFile(null);
            })
            .catch(err => {
                console.error("Lỗi khi cập nhật ảnh:", err);
                alert("Đã có lỗi xảy ra khi cập nhật ảnh!");
            });

    };



    useEffect(() => {
        fetch("http://localhost:8080/user/user_profile", { credentials: "include" })
            .then((res) => {
                if (res.status === 404) throw new Error("User not found");
                return res.json();
            })
            .then((data) => {
                setUser(data);
                setFormData({
                    fullName: data.fullName || "",
                    email: data.email || "",
                    description: data.description || "",
                    phone: data.phone || "",
                    userImgUrl: data.userImgUrl || "",
                    age: data.age || "",
                    birthday: data.birthday || "",
                    idNumber: data.idNumber || "",
                    job: data.job || "",
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Lỗi lấy dữ liệu:", err);
                setLoading(false);
            });
    }, []);

    const handleOpenImageModal = () => setImageModalOpen(true);

    const handleDeleteNotification = (notificationId) => {
        fetch(`http://localhost:8080/notification/delete?notificationId=${notificationId}`, {
            method: "DELETE",
            credentials: "include", // Đảm bảo gửi cookie cùng request
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Lỗi: ${response.status}`);
                }
                // Cập nhật lại danh sách thông báo sau khi xóa
                setNotifications((prevNotifications) =>
                    prevNotifications.filter((noti) => noti.id !== notificationId)
                );
            })
            .catch((error) => {
                console.error("Lỗi khi xóa thông báo:", error);
                alert("Đã có lỗi xảy ra khi xóa thông báo!");
            });
    };


    const handleUpdate = () => {
        // Chuyển đổi giá trị rỗng thành null
        const cleanedData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => [key, value || null])
        );

        console.log("Dữ liệu gửi đi:", JSON.stringify(cleanedData)); // Log dữ liệu trước khi gửi

        fetch("http://localhost:8080/user/edit_profile", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(cleanedData),
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
            })
            .catch(err => {
                console.error("Lỗi khi cập nhật:", err);
                alert("Đã có lỗi xảy ra khi cập nhật!");
            });
    };

    return (
        <>
            {/* Header + Sidebar */}
            <Header setOpen={setSidebarOpen} />
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <Grid container spacing={3} sx={{ maxWidth: 1000, margin: "auto", padding: 3 }}>
                {/* Left Panel */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ textAlign: "center", padding: 3 }}>
                        {loading ? (
                            <CircularProgress />
                        ) : user ? (
                            <>
                                <Box sx={{ position: "relative", display: "inline-block", margin: "auto" }} onClick={handleOpenDialog} >
                                    <Avatar
                                        src={user?.userImgUrl || ""}
                                        sx={{ width: 80, height: 80, cursor: "pointer" }}
                                        onClick={handleOpenImageModal}
                                    />
                                    {/* Overlay hiển thị khi hover */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            width: "100%",
                                            height: "100%",
                                            bgcolor: "rgba(0, 0, 0, 0.5)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            opacity: 0,
                                            transition: "0.3s",
                                            cursor: "pointer",
                                            "&:hover": { opacity: 1 },
                                        }}
                                    >
                                        <EditIcon sx={{ color: "white", fontSize: 24 }} />
                                    </Box>
                                </Box>
                                <Typography variant="h6" sx={{ marginTop: 1 }}>
                                    {user.fullName}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {user.job}
                                </Typography>

                                <Typography variant="body2" sx={{ marginTop: 2 }}>
                                    Căn hộ <span style={{ color: "orange" }}>{user.apartmentName}</span>
                                </Typography>
                                <Typography variant="body2">
                                    Vai trò <span style={{ color: "green" }}>{user.role}</span>
                                </Typography>
                                <Typography variant="body2">
                                    Current opportunities <b>6</b>
                                </Typography>

                                <Button variant="contained" sx={{ marginTop: 2, width: "100%" }}>
                                    View Public Profile
                                </Button>
                            </>
                        ) : (
                            <Typography variant="h6">Không tìm thấy thông tin người dùng</Typography>
                        )}
                    </Card>
                </Grid>
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Hình ảnh đại diện
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseDialog}
                            sx={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <img src={selectedImage || user?.userImgUrl} alt="Avatar" className="avatar-preview" style={{ width: "250px", height: "250px", borderRadius: "50%", objectFit: "cover" }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">Đóng</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            component="label"
                        >
                            Tải ảnh lên
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </Button>
                        {selectedFile && (
                            <Button variant="contained" color="primary" onClick={handleUploadImage}>
                                Cập nhật
                            </Button>
                        )}
                    </DialogActions>

                </Dialog>

                {/* Right Panel */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ marginBottom: 2 }}>
                                <Tab label="Account Settings" />
                                <Tab label="Đổi mật khẩu" />
                                <Tab label="Notifications" />
                            </Tabs>

                            {tab === 0 && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            label="Họ tên"
                                            name="fullName"
                                            fullWidth
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.fullName }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Email"
                                            name="email"
                                            fullWidth
                                            value={formData.email}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.email }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Số điện thoại"
                                            name="phone"
                                            fullWidth
                                            value={formData.phone}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.phone }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            label="Tuổi"
                                            name="age"
                                            fullWidth
                                            value={formData.age}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.age }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Mô tả"
                                            name="description"
                                            fullWidth
                                            multiline
                                            value={formData.description}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.description }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Ngày sinh"
                                            name="birthday"
                                            type="date"
                                            fullWidth
                                            value={formData.birthday}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: true }} // Đảm bảo hiển thị label
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Nghề nghiệp"
                                            name="job"
                                            fullWidth
                                            value={formData.job}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.job }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            label="Căn cước công dân"
                                            name="idNumber"
                                            fullWidth
                                            value={formData.idNumber}
                                            onChange={handleChange}
                                            InputLabelProps={{ shrink: !!formData.idNumber }}
                                            InputProps={{
                                                readOnly: true,
                                                sx: {
                                                    pointerEvents: "none", // Ngăn chặn sự kiện chuột
                                                    borderColor: "transparent !important", // Ẩn viền khi focus
                                                    "&:hover": {
                                                        borderColor: "transparent !important", // Ngăn đổi màu khi hover
                                                    }
                                                }
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button variant="contained" fullWidth onClick={handleUpdate}>
                                            Cập nhật
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                            {tab === 1 && (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            label="Mật khẩu cũ"
                                            name="old_password"
                                            fullWidth
                                            // value={formData.fullName}
                                            onChange={handleChange}
                                        // InputLabelProps={{ shrink: !!formData.fullName }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12}>
                                        <TextField
                                            label="Mật khẩu mới"
                                            name="new_password"
                                            fullWidth
                                            // value={formData.fullName}
                                            onChange={handleChange}
                                        // InputLabelProps={{ shrink: !!formData.fullName }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Button variant="contained" fullWidth onClick={handleUpdate}>
                                            Cập nhật
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                            {tab === 2 && (
                                <Box>
                                    {notifications.length > 0 ? (
                                        notifications.map((noti, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    padding: "10px",
                                                    borderBottom: "1px solid #ddd",
                                                    position: "relative",
                                                    "&:hover .delete-btn": { opacity: 1 } // Hiển thị khi hover
                                                }}
                                            >
                                                <Typography onClick={() => handleNotificationClick(noti)} sx={{ cursor: "pointer", flex: 1 }}>
                                                    {noti.notificationContent}
                                                </Typography>
                                                <IconButton
                                                    className="delete-btn"
                                                    sx={{
                                                        opacity: 0, // Ẩn mặc định
                                                        transition: "opacity 0.3s ease-in-out",
                                                    }}
                                                    onClick={() => handleDeleteNotification(noti.id)} // Gọi hàm xóa khi nhấn vào nút "x"
                                                >
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography>Không có thông báo nào</Typography>
                                    )}

                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </>
    );
};

export default Profile;
