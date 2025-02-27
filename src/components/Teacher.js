import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";

import Sidebar from "./Sidebar";
import UploadFileQuestion from "./UploadFileQuestion";
import Headercontent from "./HeaderContent.js";
import QuestionBank from "./QuestionBank";
import CreateQuiz from "./CreateQuiz";
import QuizList from "./QuizList";
import ManageClassroms from "./ManageClassrooms";
import { QuestionProvider } from "./QuestionContext";

const Teacher = () => {
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")); 
  console.log("Nhận được ID từ localStorage là: ", user.user_id)

  // Lấy giá trị "section" từ query params, mặc định là "home"
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") || "home";

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <h2>Trang chủ của giáo viên</h2>;

      case "my_quiz":
        return !isCreatingQuiz ? (
          <QuizList onCreateQuiz={() => setIsCreatingQuiz(true)} userRole="teacher" />
        ) : (
          <div>
            <Button variant="secondary" className="mb-3" onClick={() => setIsCreatingQuiz(false)}>
              ← Quay lại
            </Button>
            <CreateQuiz teacherId={user.user_id} onQuizCreated={() => setIsCreatingQuiz(false)} />
          </div>
        );

      case "manage_classrooms":
        return <ManageClassroms teacherId={user.user_id} />;

      case "question_bank":
        return (
          <>
            <UploadFileQuestion teacherId={user.user_id} />
            <QuestionBank teacherId={user.user_id} />
          </>
        );

      default:
        return <h2>Chọn một danh mục từ Sidebar</h2>;
    }
  };

  return (
    <QuestionProvider>
      <div className="d-flex">
        <Sidebar />
        <div className="content flex-grow-1 p-3" style={{ marginLeft: "250px" }}>
          <Headercontent />
          {renderSection()}
        </div>
      </div>
    </QuestionProvider>
  );
};

export default Teacher;
