import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo/logo_transparent_blue.png';
import avatar from '../assets/images/avartar_defaul_1.png';

const Header = ({ user, onLogout, onAuthClick }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false); // Trạng thái menu dropdown
  const dropdownRef = useRef(null); // Tham chiếu đến Dropdown

  // Xử lý sự kiện click bên ngoài Dropdown
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false); // Tắt Dropdown nếu click bên ngoài
    }
  };

  // Thêm và loại bỏ sự kiện mousedown
  useEffect(() => {
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup sự kiện khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <header className="bg-white border-bottom sticky-top" style={{height: "80px"}}>
      <nav className="navbar navbar-expand-lg navbar-light mx-5">
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
              {user ? (
                <div
                  ref={dropdownRef} // Gắn tham chiếu vào Dropdown
                  className="position-relative d-flex align-items-center border border-primary px-3 py-1"
                  style={{
                    marginLeft: "20px",
                    borderWidth: "4px",
                    backgroundColor: "white",
                    borderRadius: "50px",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{
                      width: "40px",
                      height: "40px",
                      objectFit: "cover",
                    }}
                  />
                  <span className="ms-2">{user.username}</span>
                  {showDropdown && (
                    <div
                      className="position-absolute bg-white border rounded shadow-sm"
                      style={{
                        top: "50px",
                        right: "0",
                        zIndex: 1000,
                        minWidth: "150px",
                      }}
                    >
                      <ul className="list-unstyled m-0 p-2">
                        <li>
                          <button
                            className="btn btn-link w-100 text-start"
                            onClick={() => alert("Thông tin tài khoản")}
                          >
                            Thông tin tài khoản
                          </button>
                        </li>
                        <li>
                          <button
                            className="btn btn-link w-100 text-start text-danger"
                            onClick={() => {
                              onLogout();
                              localStorage.removeItem("lastPath"); // Xóa thông tin trang cuối cùng
                              navigate("/"); // Quay lại trang chủ khi đăng xuất
                            }}
                          >
                            Đăng xuất
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="btn btn-outline-primary ms-3"
                  onClick={onAuthClick}
                >
                  Đăng nhập / Đăng ký
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
