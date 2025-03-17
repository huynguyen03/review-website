
// import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import StudentClassrooms from "./StudentClassrooms"
import HeaderContent from "./HeaderContent"
import StudentExams from "./StudentExams"
import HomePage from "./HomePage";



const Users = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Nhận được ID từ localStorage là: ", user)

  // Lấy giá trị "section" từ query params, mặc định là "home"
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") || "home";
  console.log("Đã chọn vào mục ở sidebar", activeSection);


  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomePage userId={user.user_id} roleId={user.role_id}/>
          ;

      case "my_quiz":
        return (
          <StudentExams userId={user.user_id} />
        );

      case "my_classrooms":
        return <StudentClassrooms userId={user.user_id} roleId={user.role_id}/>;

      default:
        return <h2>Chọn một danh mục từ Sidebar</h2>;
    }
  };

  return (
    <div className="d-flex">
      <Sidebar roleId="2" />
      <div className="content flex-grow-1 p-3" style={{ marginLeft: "250px" }}>

        <HeaderContent />
        {renderSection()}

      </div>
    </div>
  );
};

export default Users;
