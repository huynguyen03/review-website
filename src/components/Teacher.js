import React, { useState } from "react";
import Sidebar from './Sidebar';
import UploadFileQuestion from "./UploadFileQuestion";
import Headercontent from "./HeaderContent.js";
import QuestionBank from "./QuestionBank.js";
import CreateQuiz from "./CreateQuiz.js";
import QuizList from "./QuizList"; // Import Component mới
import ManageClassroms from "./ManageClassrooms"; // Import component quản lý học sinh
import { QuestionProvider } from "./QuestionContext";
import { Button } from "react-bootstrap";


const Teacher = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  return (
    <QuestionProvider>
      <div className="d-flex">
        <Sidebar setActiveSection={setActiveSection} />
        <div className="content flex-grow-1 p-3" style={{ marginLeft: "250px" }}>
          <Headercontent />

          {/* Khi chọn "Bài tập của tôi" */}
          {activeSection === "my_quiz" && (
            <>
              {!isCreatingQuiz ? (
                <QuizList onCreateQuiz={() => setIsCreatingQuiz(true)} userRole="teacher" />

              ) : (
                <div>
                  <Button variant="secondary" className="mb-3" onClick={() => setIsCreatingQuiz(false)}>
                    ← Quay lại
                  </Button>
                  <CreateQuiz
                    teacherId={localStorage.getItem("user_id")}
                    onQuizCreated={() => setIsCreatingQuiz(false)}
                  />
                </div>
              )}
            </>
          )}
          {/* Khi chọn "Quản lý học sinh" */}
          {activeSection === "manage_classrooms" && (
            <ManageClassroms teacherId={localStorage.getItem("user_id")}/>
          )}
          {/* Khi chọn "Ngân hàng câu hỏi" */}
          {activeSection === "question_bank" && (
            <>
              <UploadFileQuestion teacherId={localStorage.getItem("user_id")} />
              <QuestionBank teacherId={localStorage.getItem("user_id")} />
            </>
          )}
        </div>
      </div>
    </QuestionProvider>
  );
};

export default Teacher;
