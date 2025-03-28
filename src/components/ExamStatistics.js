import React, { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { exportScores } from "./exportScores";

// Đăng ký các thành phần của Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const ExamStatistics = ({ examId, userId }) => {
  const [examData, setExamData] = useState([]);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/fetch_exam_results.php?exam_id=${examId}&user_id=${userId}`
        );
        const data = await response.json();
        setExamData(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài thi:", error);
      }
    };

    fetchExamData();
  }, [examId]);

  // Xử lý dữ liệu biểu đồ
  const scores = examData.map((item) => item.score);
  const labels = examData.map((item) => `${item.fullname}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Điểm số",
        data: scores,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h3>📊 Thống kê điểm số</h3>

      <h5>🔢 Biểu đồ điểm số</h5>
      <Bar data={chartData} />

      <h5 className="mt-4">📋 Bảng điểm chi tiết</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Học sinh</th>
            <th>Điểm số</th>
            <th>Thời gian làm bài</th>
            <th>Mức độ 1 (%)</th>
            <th>Mức độ 2 (%)</th>
            <th>Mức độ 3 (%)</th>
            <th>Mức độ 4 (%)</th>
          </tr>
        </thead>
        <tbody>
          {examData.map((student, index) => (
            <tr key={student.student_id}>
              <td>{index + 1}</td>
              <td>{student.fullname}</td>
              <td>{student.score}</td>
              <td>{new Date(student.submission_time).toLocaleString()}</td>
              <td>{student.percent_1}%</td>
              <td>{student.percent_2}%</td>
              <td>{student.percent_3}%</td>
              <td>{student.percent_4}%</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={() => exportScores(examData)}>📥 Xuất file điểm</Button>
    </div>
  );
};

export default ExamStatistics;
