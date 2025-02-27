import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo/logo_transparent_1.png";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { key: "home", icon: "fas fa-home", label: "Trang chủ" },
    { key: "my_quiz", icon: "fas fa-file-alt", label: "Bài tập của tôi" },
    { key: "manage_classrooms", icon: "fas fa-chalkboard-teacher", label: "Quản lý lớp học" },
    { key: "question_bank", icon: "fas fa-database", label: "Ngân hàng câu hỏi" },
  ];

  return (
    <aside className="fixed-left fixed-bottom bg-dark text-white p-3" style={{ maxWidth: "250px", height: "100vh" }}>
      <div className="text-center mb-4">
        <img src={logo} alt="Logo" className="img-fluid" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.key} className="nav-item">
            <button
              className="nav-link text-white"
              onClick={() => navigate(`/teacher?section=${item.key}`)}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
