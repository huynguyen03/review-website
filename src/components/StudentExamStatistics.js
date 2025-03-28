import React, { useState, useEffect } from "react";
import { Card, ListGroup, ProgressBar, Row, Col, Badge } from "react-bootstrap";
import { Pie } from "react-chartjs-2"; // Biểu đồ Pie
import axios from "axios";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Đăng ký các thành phần cần thiết trong Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const apiUrl = process.env.REACT_APP_API_BASE_URL;

const ExamStatistics = ({ examId, userId }) => {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi API để lấy dữ liệu bài thi
    const fetchExamData = async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/fetch_exam_results.php?exam_id=${examId}&user_id=${userId}`
        );
        if (response.data) {
          setExamData(response.data[0]); // Vì API trả về một mảng, nên lấy phần tử đầu tiên
        }
      } catch (err) {
        setError("Failed to fetch exam data");
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId, userId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Tính toán tỷ lệ đúng và sai cho từng mức độ
  const levels = [
    { level: 1, correct: examData.correct_1, total: examData.total_1, percent: examData.percent_1 },
    { level: 2, correct: examData.correct_2, total: examData.total_2, percent: examData.percent_2 },
    { level: 3, correct: examData.correct_3, total: examData.total_3, percent: examData.percent_3 },
    { level: 4, correct: examData.correct_4, total: examData.total_4, percent: examData.percent_4 }
  ];

  const levelStats = levels.map(levelData => {
    const { level, correct, total } = levelData;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;  // Tính tỷ lệ đúng cho mỗi mức độ
  
    return {
      level,
      total,
      correct,
      accuracy,
      percent: levelData.percent // Dữ liệu tỷ lệ đã có sẵn từ API
    };
  });

  // Dữ liệu cho các biểu đồ nhỏ: tỷ lệ đúng cho mỗi mức độ
  const pieData = (correct, total) => ({
    labels: ['Đúng', 'Sai'],
    datasets: [
      {
        data: [correct, total - correct], // Đúng, Sai
        backgroundColor: ['#4caf50', '#f44336'], // Xanh lá cho đúng, Đỏ cho sai
      },
    ],
  });

  // Dữ liệu cho biểu đồ pie lớn: tỷ lệ các mức độ câu hỏi trong bài thi
  const chartData = {
    labels: levels.map(level => `Mức độ ${level.level}`), // Cập nhật cách lấy nhãn biểu đồ
    datasets: [
      {
        data: levels.map(level => level.total), // Dùng tổng câu hỏi cho từng mức độ
        backgroundColor: ["#4caf50", "#ffeb3b", "#ff9800", "#f44336"], // Màu cho từng mức độ
      },
    ],
  };

  // Cấu hình cho biểu đồ lớn (Pie chart)
  // Cấu hình cho biểu đồ Pie lớn
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
          top: 20,    // Khoảng cách từ biểu đồ đến các thành phần phía trên (như tiêu đề, chú thích...)
          bottom: 20, // Khoảng cách từ biểu đồ đến các thành phần phía dưới
          left: 20,   // Khoảng cách từ biểu đồ đến các thành phần bên trái
          right: 20,  // Khoảng cách từ biểu đồ đến các thành phần bên phải
        },
      },
    plugins: {
      legend: {
        position: 'right',  // Chú thích nằm bên phải
        labels: {
        //   usePointStyle: true, // Dùng điểm để thể hiện các biểu tượng
          boxWidth: 30,  // Điều chỉnh kích thước chiều rộng của biểu tượng trong chú thích
          boxHeight: 20, // Điều chỉnh kích thước chiều cao của biểu tượng trong chú thích
          padding: 20,   // Khoảng cách giữa biểu đồ và chú thích
        },
        padding: 50, // Khoảng cách tổng thể giữa biểu đồ và chú thích
      },
      datalabels: {
        formatter: (value, context) => {
          const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: 'white',
        font: {
          weight: 'bold',
          size: 14,
        },
      },
    },
  };
  

  return (
    <Card className="p-4">
      <Card.Header>
        <h4 className="title">Thông số bài thi</h4>
      </Card.Header>
      <ListGroup variant="flush">
        {/* Thời gian làm bài */}
        <ListGroup.Item>
          <strong>Thời gian làm bài:</strong> {examData.timeSpent} / {examData.maxTime} phút
          <ProgressBar now={(examData.timeSpent / examData.maxTime) * 100} />
        </ListGroup.Item>

        {/* Thống kê số câu đúng theo mức độ trong các ô có màu sắc */}
        <ListGroup.Item>
          <strong>Số câu hỏi đúng theo mức độ:</strong>
          <Row>
            {levelStats.map(({ level, correct, total }, index) => (
              <Col key={index} sm={6} md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h6>Mức độ {level}</h6>
                    <Badge pill bg="info">{correct} câu</Badge>
                    <p>{total} câu trong bài thi</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </ListGroup.Item>

        {/* Thống kê điểm số */}
        <ListGroup.Item>
          <strong>Tổng điểm:</strong> {examData.score}
        </ListGroup.Item>
      </ListGroup>

      <Card.Body>
        {/* Biểu đồ nhỏ: Tỷ lệ đúng theo mức độ */}
        <h5>Biểu đồ tỷ lệ đúng theo mức độ</h5>
        <Row>
          {levels.map((level, index) => (
            <Col key={index} md={3} className="mb-4">
              <Card>
                <Card.Body>
                  <h6>Mức độ {level.level}</h6>
                  <Pie data={pieData(level.correct, level.total)} />
                  <p>Tỷ lệ đúng: {level.percent}%</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Biểu đồ Pie lớn: Tỷ lệ câu hỏi theo mức độ */}
        <h5>Biểu đồ tỷ lệ câu hỏi theo mức độ</h5>
        <div style={{ width: '70%',height: '400px',  margin: '0 auto' }}>
          <Pie data={chartData} options={chartOptions} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExamStatistics;
