import { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Chip, MenuItem, Select, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, Snackbar, Alert
} from "@mui/material";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react"; // Sử dụng QRCodeCanvas
import { Box } from "@mui/material";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";


// Hàm lấy màu trạng thái
const getStatusColor = (status) => {
    switch (status) {
        case "paid":
            return "success";
        case "pending":
            return "warning";
        case "overdue":
            return "error";
        default:
            return "default";
    }
};

const ResidentInvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedBill, setSelectedBill] = useState(null);
    const [open, setOpen] = useState(false);
    const [alert, setAlert] = useState({ open: false, message: "", severity: "info" });
    const [openQRCode, setOpenQRCode] = useState(false);

    // Gọi API lấy danh sách hóa đơn
    const fetchInvoices = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/bill/view_bill_list?month=${month}&year=${year}`, { withCredentials: true });
    
            if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                setInvoices(response.data.data); // Lấy danh sách hóa đơn từ response.data.data
            } else {
                setInvoices([]);
                setAlert({ open: true, message: response.data.message || "Không có hóa đơn nào!", severity: "warning" });
            }
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu hóa đơn:", error);
            setAlert({ open: true, message: "Lỗi khi tải hóa đơn!", severity: "error" });
            setInvoices([]);
        }
    };
    
    // Xử lý thanh toán khi quét mã QR
    const processPayment = async (billId) => {
        try {
            const response = await axios.post(
                "http://localhost:8080/payment/process",
                { billId },
                { withCredentials: true }
            );

            if (response.data && response.data.success) {
                setAlert({ open: true, message: "Thanh toán thành công!", severity: "success" });
                setOpenQRCode(false);
                fetchInvoices(); // Cập nhật lại danh sách hóa đơn
            } else {
                throw new Error(response.data.message || "Thanh toán thất bại!");
            }
        } catch (error) {
            setAlert({ open: true, message: error.message || "Lỗi khi thanh toán!", severity: "error" });
            console.error("Lỗi khi thanh toán:", error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [month, year]); // Cập nhật lại khi tháng hoặc năm thay đổi
    const normalizeContent = (content) => content.normalize("NFD").replace(/[^a-zA-Z0-9 ]/g, "");
    const crc16 = (buffer) => {
        let crc = 0xFFFF;
        for (let i = 0; i < buffer.length; i++) {
            crc = ((crc >>> 8) | (crc << 8)) & 0xffff;
            crc ^= buffer.charCodeAt(i) & 0xff;
            crc ^= ((crc & 0xff) >> 4);
            crc ^= (crc << 12) & 0xffff;
            crc ^= ((crc & 0xff) << 5) & 0xffff;
        }
        return crc.toString(16).toUpperCase().padStart(4, "0");
    };

    const generateVietQRString = () => {
        if (!selectedBill) return "";
        const amount = selectedBill.total.toString().replace(/\D/g, "");
        const content = `Tien dien nuoc thang ${month} can ho 3 Nguyen Viet`.replace(/ /g, "%20");
        const accountNumber = "2008206221450";

        let qrData = `00020101021238570010A000000727012700069704050113${accountNumber}0208QRIBFTTA5303704540${amount.length}${amount}5802VN62${content.length
            .toString()
            .padStart(2, "0")}${content}`;

        return qrData + "6304" + crc16(qrData);
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Header />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Paper sx={{ padding: 2 }}>
                        <Typography variant="h5" gutterBottom>
                            Danh sách hóa đơn của bạn
                        </Typography>

                        {/* Bộ lọc tháng và năm */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                                {[...Array(12).keys()].map((m) => (
                                    <MenuItem key={m + 1} value={m + 1}>{`Tháng ${m + 1}`}</MenuItem>
                                ))}
                            </Select>
                            <Select value={year} onChange={(e) => setYear(e.target.value)}>
                                {[2023, 2024, 2025, 2026].map((y) => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </Select>
                            <Button variant="contained" onClick={fetchInvoices}>Lọc</Button>
                        </div>

                        {/* Bảng hóa đơn */}
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã Hóa Đơn</TableCell>
                                        <TableCell>Số Tiền</TableCell>
                                        <TableCell>Nội Dung</TableCell>
                                        <TableCell>Trạng Thái</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoices.length > 0 ? (
                                        invoices.map((invoice) => (
                                            <TableRow
                                                key={invoice.billId}
                                                onClick={() => { setSelectedBill(invoice); setOpen(true); }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <TableCell>{invoice.billId}</TableCell>
                                                <TableCell>{invoice.total.toLocaleString()} VND</TableCell>
                                                <TableCell>{invoice.billContent}</TableCell>
                                                <TableCell>
                                                    <Chip label={invoice.status} color={getStatusColor(invoice.status)} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">Không có dữ liệu</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Modal hiển thị chi tiết bill */}
                        <Dialog open={open} onClose={() => setOpen(false)}>
                            <DialogTitle>Chi Tiết Hóa Đơn</DialogTitle>
                            <DialogContent>
                                {selectedBill ? (
                                    <div>
                                        <Typography><strong>Mã Hóa Đơn:</strong> {selectedBill.billId}</Typography>
                                        <Typography><strong>Số Tiền:</strong> {selectedBill.total.toLocaleString()} VND</Typography>
                                        <Typography><strong>Nội Dung:</strong> {selectedBill.billContent}</Typography>
                                        <Typography><strong>Tiền Điện:</strong> {selectedBill.electricBill.toLocaleString()} VND</Typography>
                                        <Typography><strong>Tiền Nước:</strong> {selectedBill.waterBill.toLocaleString()} VND</Typography>
                                        <Typography><strong>Khác:</strong> {selectedBill.others.toLocaleString()} VND</Typography>
                                        <Typography><strong>Trạng Thái:</strong> {selectedBill.status}</Typography>
                                        <Typography><strong>Ngày Lập:</strong> {new Date(selectedBill.billDate).toLocaleDateString()}</Typography>
                                        <Typography><strong>Người trả:</strong> {selectedBill.username}</Typography>
                                    </div>
                                ) : (
                                    <Typography>Đang tải...</Typography>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpen(false)}>Đóng</Button>
                                {selectedBill && selectedBill.status === "payed" ? (
                                    <Button variant="contained" color="primary">
                                        Chi tiết
                                    </Button>
                                ) : (
                                    <Button variant="contained" color="error" onClick={() => setOpenQRCode(true)}>
                                        Thanh Toán
                                    </Button>
                                )}
                                {/* {selectedBill && selectedBill.status !== "paid" && (
                                    <Button variant="contained" color="error" onClick={() => setOpenQRCode(true)}>
                                        Thanh toán
                                    </Button>
                                )} */}
                            </DialogActions>
                        </Dialog>

                        {/* Modal hiển thị ảnh QR */}
                        <Dialog open={openQRCode} onClose={() => setOpenQRCode(false)}>
                            <DialogTitle>Mã QR Hóa Đơn</DialogTitle>
                            <DialogContent>
                                <QRCodeCanvas
                                    value={generateVietQRString()}  // Sử dụng hàm generateQRCodeURL để tạo giá trị mã QR
                                    size={256}  // Kích thước mã QR
                                    level="H"  // Độ phức tạp của mã QR (L, M, Q, H)
                                    includeMargin={true}  // Bao gồm lề
                                />

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenQRCode(false)}>Đóng</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Snackbar hiển thị thông báo */}
                        <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })}>
                            <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
                                {alert.message}
                            </Alert>
                        </Snackbar>
                    </Paper>
                </Box>
            </Box>
        </Box>

    );
};

export default ResidentInvoiceList;
