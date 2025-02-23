import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/Home.js";
import Users from "./components/Users.js";
import Teacher from "./components/Teacher.js";
import Header from "./components/Header.js";
import AuthForm from "./components/AuthForm.js";

function Main({ user, setUser, showAuthForm, setShowAuthForm, handleLogin, handleLogout }) {
  const location = useLocation();

  // Lưu trạng thái người dùng và đường dẫn hiện tại vào Local Storage
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); // Lưu thông tin người dùng
    }
    localStorage.setItem("lastPath", location.pathname); // Lưu đường dẫn hiện tại
  }, [user, location.pathname]);

  return (
    <>
      {/* Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        onAuthClick={() => setShowAuthForm(true)} // Hiển thị AuthForm khi nhấn
      />

      {/* Các Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users" element={user ? <Users /> : <Navigate to="/" />} />
        <Route path="/teacher" element={user?.role_id === "1" ? <Teacher /> : <Navigate to="/" />} />
      </Routes>

      {/* Hiển thị AuthForm */}
      {showAuthForm && (
        <div
          id="auth-form-container"
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
          onClick={(e) => {
            if (e.target.id === "auth-form-container") {
              setShowAuthForm(false); // Đóng form khi click ra ngoài
            }
          }}
        >
          <AuthForm
            onClose={() => setShowAuthForm(false)} // Đóng form
            onLogin={handleLogin} // Xử lý đăng nhập
          />
        </div>
      )}
    </>
  );
}

function App() {
  const [showAuthForm, setShowAuthForm] = useState(false); // Kiểm soát hiển thị form
  const [user, setUser] = useState(null); // Quản lý thông tin người dùng
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  // Khôi phục trạng thái khi tải lại
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const lastPath = localStorage.getItem("lastPath");

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Khôi phục thông tin người dùng
    }

    if (lastPath && lastPath !== window.location.pathname) {
      window.history.replaceState(null, null, lastPath); // Chuyển đến trang cuối cùng
    }

    setLoading(false); // Kết thúc trạng thái tải
  }, []);

  const handleLogin = (userData) => {
    setShowAuthForm(false); // Đóng form đăng nhập
    setUser(userData); // Lưu thông tin người dùng
  };

  const handleLogout = () => {
    setUser(null); // Xóa thông tin người dùng
    setShowAuthForm(false); // Đảm bảo không hiển thị AuthForm khi vừa đăng xuất
    localStorage.clear(); // Xóa tất cả thông tin trong Local Storage
  };

  if (loading) {
    // Hiển thị màn hình chờ khi khôi phục trạng thái
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Main
        user={user}
        setUser={setUser}
        showAuthForm={showAuthForm}
        setShowAuthForm={setShowAuthForm}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
