import React, { createContext, useContext, useState, useCallback } from "react";

const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [questions, setQuestions] = useState([]);

  // ✅ Dùng useCallback để tối ưu việc gọi API
  const fetchQuestions = useCallback(async (teacherId) => {
    if (!teacherId) return;
    console.log("Không nhận được ID giáo viên với yêu cầu lấy câu hỏi!!!")
    
    try {
      console.log(`Đang lấy về câu hỏi cho giáo viên có ID: ${teacherId}`);
      const res = await fetch(`http://localhost/react_api/fetch_questions.php?teacher_id=${teacherId}`);
      
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  }, []);

  // ✅ Hàm cập nhật danh sách câu hỏi cục bộ mà không cần fetch lại API
  const updateQuestions = (updatedQuestions) => {
    setQuestions(updatedQuestions);
  };

  return (
    <QuestionContext.Provider value={{ questions, fetchQuestions, updateQuestions }}>
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestions = () => {
  return useContext(QuestionContext);
};
