const API_BASE = "http://localhost:8080/api";

export async function login(userName, password) {
    const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ userName, password }).toString(),
        credentials: "include",
    });

    return response.text();
}

export const getUser = async () => {
    const response = await fetch(`${API_BASE}/user`, {
        method: "GET",
        credentials: "include",
    });

    if (response.status === 401) {
        sessionStorage.removeItem("loggedInUser"); // Xóa session frontend
        window.location.href = "http://localhost:3000"; // Chuyển về trang đăng nhập
        return null;
    }

    return response.json(); // Trả về dữ liệu user nếu vẫn đăng nhập
};

export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE}/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (!response.ok) throw new Error("Lỗi khi logout!");

        sessionStorage.removeItem("loggedInUser"); // Xóa session frontend
        return await response.text();
    } catch (error) {
        console.error("Lỗi khi logout:", error);
        throw error;
    }
};