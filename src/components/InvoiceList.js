import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, MenuItem, Select, Button } from "@mui/material";
import axios from "axios";

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

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/bill/getAll?month=${month}&year=${year}`);
      setInvoices(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hóa đơn: ", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Danh sách hóa đơn
      </Typography>
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
        <Button variant="contained" onClick={fetchInvoices}>
          Lọc
        </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã Hóa Đơn</TableCell>
              <TableCell>Khách Hàng</TableCell>
              <TableCell>Số Tiền</TableCell>
              <TableCell>Nội Dung</TableCell>
              <TableCell>Trạng Thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.billId}>
                <TableCell>{invoice.billId}</TableCell>
                <TableCell>{invoice.username}</TableCell>
                <TableCell>{invoice.total.toLocaleString()} VND</TableCell>
                <TableCell>{invoice.billContent}</TableCell>
                <TableCell>
                  <Chip label={invoice.status} color={getStatusColor(invoice.status)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default InvoiceList;
