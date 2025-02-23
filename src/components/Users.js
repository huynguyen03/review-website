
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import StudentClassrooms from "./StudentClassrooms"
import HeaderContent from "./HeaderContent"
import StudentExams from "./StudentExams"
import HomePage from "./HomePage";



const Users = () => {
  // const user = JSON.parse(localStorage.getItem("user")) || {
  //   username: "Người dùng",
  // };
    const [activeSection, setActiveSection] = useState("home_page");
  
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user")); // Nhận thông tin từ state hoặc localStorage

  console.log("Thông tin người dùng trong Users:", user.role_id); // Log thông tin

  return (
    <div>
      <div className="d-flex">
        <Sidebar setActiveSection={setActiveSection} userRole={user.role_id} />
        <div className="content flex-grow-1 p-3" style={{ marginLeft: "250px" }}>
          <HeaderContent />
{/* Khi chọn "Bài tập của tôi" */}
{activeSection === "home_page" && (
          
<HomePage studentId={user.user_id} />
             
          )}
          {/* Khi chọn "Bài tập của tôi" */}
          {activeSection === "my_quiz" && (
          <StudentExams studentId={user.user_id} />
             
          )}
          {/* Khi chọn "Quản lý học sinh" */}
          {activeSection === "my_classrooms" && (
            <StudentClassrooms studentId={user.user_id} />
          )}
          
        </div>
      </div>
    </div>
  );
};

export default Users;
