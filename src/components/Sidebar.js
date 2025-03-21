import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo/logo_transparent_1.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesLeft,faAnglesRight } from '@fortawesome/free-solid-svg-icons'; // Import icon
const Sidebar = ({roleId}) => {
  const navigate = useNavigate();
  console.log("Role người dùng nhận khi vào sidebar", roleId)

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
console.log("mêu nu của GV hay HS", menuItems)
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

  return (
    <aside
      className={`fixed-left fixed-bottom bg-dark text-white p-3 ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        maxWidth: isOpen ? "250px" : "80px",
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
      className= {`btn mb-3 ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      style={{
        backgroundColor:  "#fff",
        position: "absolute",  // Đặt vị trí tuyệt đối trong sidebar
        top: "20px",           // Cách mép trên 20px
        left: isOpen ? "235px" : "35px", // Đổi vị trí khi mở/thu gọn
        zIndex: 10,            // Đảm bảo nút hiển thị trên các thành phần khác
        transition: 'max-width 0.3s ease-in-out', // Thêm hiệu ứng khi mở/đóng

      }}
      >
      <FontAwesomeIcon icon={isOpen ? faAnglesLeft : faAnglesRight}/>
      </button>

      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li
            key={item.key}
            className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
          >
            <button
              className="nav-link text-white sidebar-hover"
              onClick={() => handleMenuClick(item)}
              style={{
                width: "100%",
                backgroundColor: activeItem === item.key ? '#007bff' : 'transparent', // Hiệu ứng chọn
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}
            >
              <i className={`${item.icon} me-2`}></i>
              <span className={isOpen ? '' : 'd-none'}>{item.label}</span> {/* Ẩn label khi thu gọn */}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
