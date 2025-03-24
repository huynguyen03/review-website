import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo/logo_transparent_1.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faAnglesLeft, faAnglesRight, faRightFromBracket, faCircleUser } from '@fortawesome/free-solid-svg-icons'; // Import icon
import '../assets/styles/Sidebar.css';  // Import CSS file

const Sidebar = ({ roleId, onLogout }) => {
  const navigate = useNavigate();
  console.log("Role người dùng nhận khi vào sidebar", roleId);

  const menuItemsTeacher = [
    { key: "home", icon: "fas fa-home", label: "Trang chủ" },
    { key: "my_quiz", icon: "fas fa-file-alt", label: "Bài tập của tôi" },
    { key: "manage_classrooms", icon: "fas fa-chalkboard-teacher", label: "Quản lý lớp học" },
    { key: "question_bank", icon: "fas fa-database", label: "Ngân hàng câu hỏi" },
  ];

  const menuItemsStudent = [
    { key: "home", icon: "fas fa-home", label: "Trang chủ" },
    { key: "my_quiz", icon: "fas fa-file-alt", label: "Bài tập của tôi" },
    { key: "my_classrooms", icon: "fas fa-chalkboard-teacher", label: "Lớp học của tôi" },
  ];

  

  const menuItems = roleId === "1" ? menuItemsTeacher : menuItemsStudent;
  console.log("mêu nu của GV hay HS", menuItems);
  const nameRole = roleId === "1" ? "teacher" : "users";
  const [isOpen, setIsOpen] = useState(true); // State để kiểm soát trạng thái mở/đóng
  const [activeItem, setActiveItem] = useState(null); // State để lưu mục đang được chọn

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (item) => {
    setActiveItem(item.key); // Đánh dấu mục được chọn
    navigate(`/${nameRole}?section=${item.key}`);
  };



  const [showAccountMenu, setShowAccountMenu] = useState(false); // menu con tài khoản

  const handleAccountClick = () => {
    setShowAccountMenu(!showAccountMenu);
    console.log(showAccountMenu)
  };


  const handleLogout = () => {
    console.log("Đăng xuất...");
    onLogout();
    // Thực hiện logout, ví dụ: xóa token, chuyển trang, v.v.
    console.log(localStorage.getItem("user")); // Kiểm tra giá trị của lastPath
    localStorage.removeItem("lastPath"); // Xóa thông tin trang cuối cùng
    localStorage.removeItem("user"); // Xóa thông tin người dùng
    setShowAccountMenu(false)
    console.log("Xóa rồi", localStorage); // Kiểm tra giá trị của lastPath

    navigate("/"); // Quay lại trang chủ khi đăng xuất

  };

  const handleProfileClick = () => {
    navigate(`/${nameRole}?section=profile`);

  };
  return (
    <aside
      id="sidebar"
      className={`fixed-left fixed-bottom text-white p-3 ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        height: "100vh",
        transition: 'max-width 0.3s ease-in-out', // Thêm hiệu ứng khi mở/đóng
      }}
    >
      <div className="text-center mb-4">
        <img
          src={logo}
          alt="Logo"
          className="img-fluid"
          style={{
            maxWidth: "100%",
            height: "auto",
            transition: 'max-width 0.3s ease-in-out',
          }}
        />
      </div>

      <button
        onClick={toggleSidebar}
        className={`btn bg-white mb-3 sidebar-button ${isOpen ? 'sidebar-button-left' : 'sidebar-button-right'}`}
      >
        <FontAwesomeIcon icon={isOpen ? faAnglesLeft : faAnglesRight} />
      </button>

      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
          >
            <button
              className="nav-link w-100 text-white sidebar-hover"
              onClick={() => handleMenuClick(item)}
            >
              <i className={`${item.icon} me-2`}></i>
              <span className={isOpen ? '' : 'd-none'}>{item.label}</span> {/* Ẩn label khi thu gọn */}
            </button>
          </li>
        ))}
        </ul>

      
      <ul className="nav flex-column account-nav">

      <li className="nav-item">

      {showAccountMenu && (
      <div className="account-dropdown">
        <div
          className="dropdown-item d-flex align-items-center"
          onClick={handleProfileClick}
          style={{ cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faCircleUser} className="me-2" />
          Hồ sơ cá nhân
        </div>
        <div
          className="dropdown-item d-flex align-items-center"
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
          Đăng xuất
        </div>
      </div>
        )}
        </li>
        <li className="nav-item">
        <button
          className="nav-link w-100 text-white sidebar-hover"
          onClick={handleAccountClick}
        >
          <i className="fas fa-user me-2"></i>
          <span className={isOpen ? '' : 'd-none'}>Tài khoản</span>
        </button>
      </li>

      </ul>


    </aside>
  );
};

export default Sidebar;
