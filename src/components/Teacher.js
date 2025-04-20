import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import { SearchProvider } from "./SearchContext"; // Import SearchProvider

import Sidebar from "./Sidebar";
import UploadFileQuestion from "./UploadFileQuestion";
import HeaderContent from "./HeaderContent.js";
import QuestionBank from "./QuestionBank";
import CreateQuiz from "./CreateQuiz";
import QuizList from "./QuizList";
import ManageClassroms from "./ManageClassrooms";
import AccountInfo from "./AccountInfo.js";

import { QuestionProvider } from "./QuestionContext";

const Teacher = () => {
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")); 
  console.log("Nhận được user từ localStorage là: ", user)

  // Lấy giá trị "section" từ query params, mặc định là "home"
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") || "home";
  const activeExamId = searchParams.get("exam_id") || "";
  const activeClassroomId = searchParams.get("classroom_id") || "";

  const activeSub = searchParams.get("sub") || "";


  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <h2>Trang chủ của giáo viên</h2>;

      case "my_quiz":
        return !isCreatingQuiz ? (
          <QuizList onCreateQuiz={() => setIsCreatingQuiz(true)} userRole={user.role_id} userId={user.user_id} />
        ) : (
          <div>
            <Button variant="secondary" className="mb-3" onClick={() => setIsCreatingQuiz(false)}>
              ← Quay lại
            </Button>
            <CreateQuiz teacherId={user.user_id} onQuizCreated={() => setIsCreatingQuiz(false)} />
          </div>
        );

      case "manage_classrooms":
        return <ManageClassroms teacherId={user.user_id} userId={user.role_id}/>;

      case "question_bank":
        return (
          <>
            <QuestionBank teacherId={user.user_id} />
          </>
        );
        case "profile":
          return <AccountInfo userId={user.user_id} />;

      default:
        return <h2>Chọn một danh mục từ Sidebar</h2>;
    }
  };

  return (
    <QuestionProvider>
      <SearchProvider> {/* Wrap the content with SearchProvider */}
      <div className="d-flex flex-column" style={{ marginLeft: "250px", maxHeight: "100vh" }}>
        <div className="flex-grow-1 custom-heading-content">

          <HeaderContent />
        </div>
        <div className="content flex-grow-1 p-3" >
          {renderSection()}
        </div>
      </div>
    </SearchProvider>
    </QuestionProvider>
  );
};

export default Teacher;
