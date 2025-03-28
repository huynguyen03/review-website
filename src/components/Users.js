import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import { SearchProvider } from "./SearchContext"; // Import SearchProvider
import StudentClassrooms from "./StudentClassrooms";
import HeaderContent from "./HeaderContent";
import StudentExams from "./StudentExams";
import HomePage from "./HomePage";
import AccountInfo from "./AccountInfo";
import ExamSimulation from "./ExamSimulation";
import StudentExamStatistics from "./StudentExamStatistics";
import ClassroomPractice from "./ClassroomPractice";



// API URL
const apiUrl = process.env.REACT_APP_API_BASE_URL;
const Users = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  console.log("Nhận được ID từ localStorage là: ", user);

  // Lấy giá trị "section" từ query params, mặc định là "home"
  const searchParams = new URLSearchParams(location.search);
  const activeSection = searchParams.get("section") || "home";
  const activeExamId = searchParams.get("exam_id") || "";
  const activeClassroomId = searchParams.get("classroom_id") || "";

  const activeSub = searchParams.get("sub") || "";


  console.log("Đã chọn vào mục ở sidebar", activeExamId);

  const [examData, setExamData] = useState(null); // State lưu trữ dữ liệu bài thi

  // Hàm gọi API để lấy thông tin bài thi dựa vào examId
  const fetchExamDetails = async (examId) => {
    try {
      const response = await fetch(`${apiUrl}/fetch_exam_details.php?exam_id=${examId}`);
      if (!response.ok) {
        throw new Error(`Lỗi tải thông tin bài thi: ${response.status}`);
      }

      const data = await response.json();
      console.log("exam chuẩn bị truyền vào thi thât:", data)
      setExamData(data); // Lưu thông tin bài thi vào state
      
    } catch (error) {
      console.error("Lỗi khi tải thông tin bài thi:", error);
    }
  };

  // Gọi API để lấy thông tin bài thi khi activeExamId thay đổi
  useEffect(() => {
    if (activeExamId) {
      console.log("Đã nhận đc id: ", activeExamId)
      fetchExamDetails(activeExamId);
    }
  }, [activeExamId]);


  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomePage userId={user.user_id} roleId={user.role_id} />;
      case "my_quiz":
        return <StudentExams userId={user.user_id} />;
      case "my_classrooms":
        switch (activeSub) {
          case "exam_in_classroom":
            return <ClassroomPractice classroomId={activeClassroomId} userId={user.user_id} roleId={user.role_id} />;
          case "":
            return <StudentClassrooms userId={user.user_id} roleId={user.role_id} />;
        }
      case "profile":
        return <AccountInfo userId={user.user_id} />;
      case "exam":
        if (!examData) {
          return <h2>Đang tải thông tin bài thi...</h2>;
        }
        switch (activeSub) {
          
          case "taking_exam":
                return <ExamSimulation userId={user.user_id} exam={examData} />;
              
              
            case "statistic":
              return <StudentExamStatistics userId={user.user_id}  examId={activeExamId} />;

        }
      default:
        return <h2>Chọn một danh mục từ Sidebar</h2>;
    }
  };

  return (
    <SearchProvider> {/* Wrap the content with SearchProvider */}
      <div className="d-flex">
        <div className="content flex-grow-1 p-3" style={{ marginLeft: "250px" }}>
          <HeaderContent />
          {renderSection()}
        </div>
      </div>
    </SearchProvider>
  );
};

export default Users;
