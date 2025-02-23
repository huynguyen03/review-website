import React from 'react';
import logo from '../assets/images/logo/logo_transparent_1.png';

const Sidebar = ({ setActiveSection, userRole }) => (
  <aside className="fixed-left fixed-bottom bg-dark text-white p-3" style={{ maxWidth: "250px", height: "100vh" }}>
    <div className="text-center mb-4">
      <img
        src={logo}
        alt="Logo"
        className="img-fluid"
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
    <ul className="nav flex-column">
    <li className="nav-item">
        <button
          className="nav-link text-white"
          onClick={() => setActiveSection("home_page")}
        >
          <i className="fas fa-user-check me-2"></i>Trang chủ
        </button>
      </li>

      <li className="nav-item">
        <button
          className="nav-link text-white"
          onClick={() => setActiveSection("my_quiz")}
        >
          <i className="fas fa-user-check me-2"></i>Bài tập của tôi
        </button>
      </li>
      <li className="nav-item">
            <button
              className="nav-link text-white"
              onClick={() => setActiveSection("my_classrooms")}
            >
              <i className="fas fa-users me-2"></i>Lớp học
            </button>
          </li>

      {/* Chỉ hiển thị cho teacher */}
      {userRole === "teacher" && (
        <>
          <li className="nav-item">
            <button
              className="nav-link text-white"
              onClick={() => setActiveSection("manage_classrooms")}
            >
              <i className="fas fa-users me-2"></i>Quản lý lớp học
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link text-white"
              onClick={() => setActiveSection("question_bank")}
            >
              <i className="fas fa-university me-2"></i>Ngân hàng câu hỏi
            </button>
          </li>
        </>
      )}
    </ul>

    <div className="nav" style={{ position: "fixed", bottom: "0" }}>
      <hr className="text-white" />
      <ul className="nav flex-column">
        <li className="nav-item">
          <a href="/help" className="nav-link text-white">
            <i className="far fa-question-circle me-2"></i>Hướng dẫn và hỗ trợ
          </a>
        </li>
        <li className="nav-item">
          <a href="/account" className="nav-link text-white">
            <i className="far fa-user me-2"></i>Tài khoản
          </a>
        </li>
      </ul>
    </div>
  </aside>
);

export default Sidebar;
