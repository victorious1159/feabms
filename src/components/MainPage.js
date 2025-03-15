import React from "react";
import { Box } from "@mui/material";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

const MainPage = () => {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <Box sx={{ flexGrow: 1, p: 3 }}>Nội dung chính ở đây</Box>
      </Box>
    </Box>
  );
};

export default MainPage;
