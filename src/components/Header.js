import React, { useState, useEffect } from 'react';
import logo from '../assets/images/logo/logo_transparent_blue.png';
import "../assets/styles/Header.css";

const Header = ({ user, onLogout, onAuthClick }) => {
  const [scrolling, setScrolling] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [bgColor, setBgColor] = useState("transparent");
  const [lastScrollY, setLastScrollY] = useState(0); // Lưu vị trí cuộn trước đó

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Kiểm tra vị trí cuộn
      if (scrollPosition > 50) {
        setScrolling(true);
        setBgColor("#003366"); // Màu nền xanh dương đậm
      } else {
        setScrolling(false);
        setBgColor("transparent"); // Nền trong suốt khi ở đầu trang
      }

      // Ẩn header khi cuộn xuống, hiển thị khi cuộn lên
      if (scrollPosition > lastScrollY) {
        // Cuộn xuống: Ẩn header
        setShowHeader(false);
      } else {
        // Cuộn lên: Hiển thị header
        setShowHeader(true);
      }

      // Cập nhật vị trí cuộn
      setLastScrollY(scrollPosition);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header 
      className={`custom-header  ${scrolling ? 'bg-header' : 'bg-transparent'} ${showHeader ? 'navbar-scrolled' : 'navbar-hidden'}`}
    >
      <nav className="navbar custom-nav navbar-expand-lg navbar-light mx-5">
        <a href="/" className="navbar-brand">
          <img src={logo} alt="Logo" width="120" />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto justify-content-center align-items-center">
            <li className="nav-item">
              <a href="/" className="nav-link active">Trang chủ</a>
            </li>
            <li className="nav-item">
              <a href="/users" className="nav-link">Bài tập của tôi</a>
            </li>
            <li className="nav-item">
              <button
                className="btn btn-outline-primary ms-3"
                onClick={onAuthClick}
              >
                Đăng nhập / Đăng ký
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
