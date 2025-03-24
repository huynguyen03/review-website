import React, { useEffect } from "react";
import { BrowserRouter as Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./Home.js";
import Users from "./Users.js";
import Teacher from "./Teacher.js";
import Header from "./Header.js";
import AuthForm from "./AuthForm.js";
import FillInfoComponent from "./FillInfoComponent.js";
function Main({ user, setUser, showAuthForm, setShowAuthForm, handleLogin, handleLogout }) {
    const location = useLocation();
  
    // Lưu trạng thái người dùng và đường dẫn hiện tại vào Local Storage
    useEffect(() => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user)); // Lưu thông tin người dùng
      }
      localStorage.setItem("lastPath", location.pathname); // Lưu đường dẫn hiện tại
  
      // Kiểm tra nếu vào /fill-info thì đóng modal
      if (location.pathname === "/fill-info") {
        setShowAuthForm(false);
      }
    }, [user, location.pathname, setShowAuthForm]);
  
    return (
      <>
        <Header
          user={user}
          onLogout={handleLogout}
          onAuthClick={() => setShowAuthForm(true)} // Hiển thị AuthForm khi nhấn
        />
  
        {/* Các Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={user?.role_id === "2" ? <Users /> : <Navigate to="/" />} />
          <Route path="/teacher" element={user?.role_id === "1" ? <Teacher /> : <Navigate to="/" />} />
          <Route path="/fill-info" element={<FillInfoComponent />} />
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

  export default Main;
  