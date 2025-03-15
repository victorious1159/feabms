import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  TextField,
} from "@mui/material";
import axios from "axios";

const BillManagePage = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [billContent, setBillContent] = useState("");
  const [otherFee, setOtherFee] = useState(""); // Phí phụ

  useEffect(() => {
    axios.get("http://localhost:8080/user/user_list")
      .then((res) => {
        setUsers(res.data.data || []); // Lấy mảng users từ res.data.data
      })
      .catch((err) => console.error("Lỗi lấy danh sách user:", err));
  }, []);
  

  const handleOpen = (user) => {
    setSelectedUser(user);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setBillContent("");
    setOtherFee(""); // Reset phí phụ
  };

  const handleCreateBill = async () => {
    if (!selectedUser || !billContent.trim()) {
      alert("Vui lòng nhập nội dung hóa đơn");
      return;
    }
  
    const billData = {
      userName: selectedUser.userName, // Kiểm tra userName có đúng không
      billContent: billContent,
      electricCons: 150,
      waterCons: 20,
      others: parseFloat(otherFee) || 0,
    };
  
    // Log dữ liệu trước khi gửi
    console.log("Dữ liệu gửi lên BE:", billData);
  
    try {
      const response = await axios.post("http://localhost:8080/bill/create", billData, {
        withCredentials: true, // Đảm bảo gửi cookie (nếu cần)
      });
  
      if (response.status === 201) {
        alert("Tạo hóa đơn thành công!");
        handleClose();
      } else {
        alert("Lỗi khi tạo hóa đơn! Vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi tạo hóa đơn:", err);
      alert("Lỗi hệ thống! Kiểm tra backend nhé.");
    }
  };
  


  return (
    <Box sx={{ p: 3 }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Danh sách user</b></TableCell>
              <TableCell><b>Lượng điện (kWh)</b></TableCell>
              <TableCell><b>Lượng nước (m³)</b></TableCell>
              <TableCell><b>Tạo hóa đơn</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              console.log("User:", user); // Kiểm tra dữ liệu user

              return (
                <TableRow key={user.userName}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>150</TableCell>
                  <TableCell>20</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => handleOpen(user)}>
                      Tạo hóa đơn
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>

        </Table>
      </TableContainer>

      {/* Modal nhập nội dung hóa đơn */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <h2>Tạo hóa đơn cho {selectedUser?.fullName}</h2>

          {/* Input hidden chứa username */}
          <TextField
            type="hidden"
            value={selectedUser?.userName || ""}
          />

          <TextField
            label="Nội dung hóa đơn"
            fullWidth
            multiline
            rows={3}
            value={billContent}
            onChange={(e) => setBillContent(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Phí phụ (VNĐ)"
            fullWidth
            type="number"
            value={otherFee}
            onChange={(e) => setOtherFee(e.target.value)}
            sx={{ mt: 2 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>Hủy</Button>
            <Button variant="contained" onClick={handleCreateBill}>Xác nhận</Button>
          </Box>
        </Box>
      </Modal>

    </Box>
  );
};

export default BillManagePage;
