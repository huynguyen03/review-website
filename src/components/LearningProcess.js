import React, { useState, useEffect } from 'react';
import { Card, Button, Form, InputGroup, FormControl, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight, faTimes } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';  // Nhập thư viện axios

const LearningProcess = ({ userId, roleId }) => {
  const [processName, setProcessName] = useState('');
  const [processDescription, setProcessDescription] = useState('');
  const [exams, setExams] = useState([]); // Danh sách các bài thi đã chọn
  const [showModal, setShowModal] = useState(false); // State để điều khiển modal
  const [showExamSelection, setShowExamSelection] = useState(false); // Hiển thị modal danh sách bài thi
  const [examList, setExamList] = useState([]); // Danh sách bài thi có sẵn từ API
  const [learningProcesses, setLearningProcesses] = useState([]); // Danh sách tiến trình ôn luyện
  const [selectedProcessId, setSelectedProcessId] = useState(null); // ID tiến trình được chọn
  const [examRates, setExamRates] = useState({}); // Dùng để lưu tỷ lệ đạt yêu cầu cho từng bài thi

  const apiUrl = process.env.REACT_APP_API_BASE_URL;


  // Fetch danh sách tiến trình từ API
  const fetchLearningProcesses = async () => {
    try {
      const response = await fetch(`${apiUrl}/fetch_learning_processes.php`, {
        method: 'POST', // Sử dụng POST để gửi dữ liệu trong body
        headers: {
          'Content-Type': 'application/json', // Đảm bảo gửi dữ liệu dưới dạng JSON
        },
        body: JSON.stringify({
          user_id: userId, // Truyền user_id trong body
          role_id: roleId,  // Truyền role_id trong body
        }),
      });
      
    } catch (error) {
      console.error('Lỗi khi lấy tiến trình ôn luyện:', error);
    }
  };

  // Fetch bài thi trong tiến trình
  const fetchExamsForProcess = async (processId) => {
    try {
      const response = await fetch(
        `${apiUrl}/fetch_exam_learning_process.php?process_id=${processId}`
      );
      const data = await response.json();
      return data; // Trả về các bài thi trong tiến trình
    } catch (error) {
      console.error('Lỗi khi lấy bài thi trong tiến trình:', error);
    }
  };

  useEffect(() => {
    fetchLearningProcesses(); // Lấy danh sách tiến trình khi component được render lần đầu
  }, [userId]);

  // Fetch danh sách bài thi từ API
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/fetch_completed_exams.php?user_id=${userId}`
        );
        const data = await response.json();
        setExamList(data);
      } catch (error) {
        console.error('Lỗi khi lấy bài thi:', error);
      }
    };

    fetchExams();
  }, [userId]);

  // Gọi API để tạo tiến trình
  const handleCreateProcess = async () => {
    try {
      const response = await fetch(`${apiUrl}/create_learnning_process.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_name: processName,
          process_description: processDescription,
          classroom_id: 1, // Ví dụ classroom_id, có thể lấy từ props hoặc state
          teacher_id: userId, // Giả sử userId là id của giáo viên
        }),
      });
      const data = await response.json();
      console.log('Đã tạo tiến trình ôn luyện:', data);
      fetchLearningProcesses(); // Gọi lại API để lấy danh sách tiến trình sau khi tạo tiến trình mới
    } catch (error) {
      console.error('Lỗi khi tạo tiến trình ôn luyện:', error);
    }
  };

  // Thêm bài thi vào tiến trình
  const handleAddExam = async (exam) => {
    if (!selectedProcessId) {
      console.error('Không có tiến trình được chọn!');
      return;
    }
    const rate = examRates[exam.exam_id] || 80; // Tỷ lệ đạt yêu cầu

    try {
      const response = await fetch(`${apiUrl}/add_exam_to_process.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_id: selectedProcessId,
          exam_id: exam.exam_id,
          order_in_process: exams.length + 1, // Đặt thứ tự bài thi
          rate: rate,
        }),
      });
      const data = await response.json();
      setExams([...exams, exam]);
      setShowExamSelection(false); // Đóng modal chọn bài thi
      console.log('Đã thêm bài thi vào tiến trình:', data);
    } catch (error) {
      console.error('Lỗi khi thêm bài thi:', error);
    }
  };
  
const handleSaveProgress = () => {
    exams.forEach((exam, index) => {
      const rate = examRates[exam.exam_id] || 80; // Tỷ lệ đạt yêu cầu
      const data = {
        process_id: selectedProcessId,
        exam_id: exam.exam_id,
        order_in_process: index + 1,
        rate: rate,  // Thêm tỷ lệ đạt yêu cầu
      };
  
      // Gửi dữ liệu đến API
      axios.post(`${apiUrl}/save_progress.php`, data)
        .then(response => {
          alert("Lưu tiến trình thành công")
          console.log("Lưu tiến trình thành công", response.data);
        })
        .catch(error => {
          console.error("Lỗi khi lưu tiến trình:", error);
        });
    });
  };
  

  // Gỡ bài thi khỏi tiến trình
  const handleRemoveExam = async (examToRemove) => {
    try {
      const response = await fetch(`${apiUrl}/remove_exam_from_process.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_id: selectedProcessId,
          exam_id: examToRemove.exam_id,
        }),
      });
      const data = await response.json();
      setExams(exams.filter((exam) => exam !== examToRemove));
      console.log('Bài thi đã được gỡ khỏi tiến trình', data);
    } catch (error) {
      console.error('Lỗi khi gỡ bài thi:', error);
    }
  };

  // Gỡ tiến trình khỏi lớp học
  const handleRemoveProcess = async (processId) => {
    try {
      const response = await fetch(`${apiUrl}/remove_learning_process.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          process_id: processId,
        }),
      });
      const data = await response.json();
      fetchLearningProcesses(); // Gọi lại API để lấy danh sách tiến trình sau khi gỡ tiến trình
      console.log('Đã gỡ tiến trình khỏi lớp học:', data);
    } catch (error) {
      console.error('Lỗi khi gỡ tiến trình khỏi lớp học:', error);
    }
  };
  const handleRateChange = (examId, value) => {
    setExamRates(prevRates => ({
      ...prevRates,
      [examId]: value,  // Cập nhật tỷ lệ của bài thi với examId tương ứng
    }));
  };
  // Hiển thị modal
  const handleShowModal = () => setShowModal(true);

  // Đóng modal
  const handleCloseModal = () => setShowModal(false);

  const handleCloseExamSelection = () => setShowExamSelection(false);

  return (
    <div>
      <h3 className="h3-header title">Tạo tiến trình ôn luyện</h3>

      {/* Modal hiển thị form tạo tiến trình */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo tiến trình ôn luyện</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Tên của tiến trình ôn luyện</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên tiến trình"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Mô tả tiến trình ôn luyện</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả tiến trình"
                value={processDescription}
                onChange={(e) => setProcessDescription(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={() => { handleCreateProcess(); handleCloseModal() }}>
              Tạo tiến trình
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Hiển thị danh sách tiến trình */}
      <div className="d-flex gap-2 ">
        <h4>Danh sách tiến trình</h4>
        <Button variant="primary" onClick={handleShowModal}>
          Tạo tiến trình
        </Button>
      </div>
      {learningProcesses.length > 0 ? (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Thông tin tiến trình */}
          <div style={{ width: '25%' }}>
            {learningProcesses.map((process) => (
                <>
              <Card key={process.process_id}>
                <Card.Body className="text-start">
                  <Card.Title>{process.process_name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Mô tả: {process.process_description}
                  </Card.Subtitle>
                  <Card.Text>Ngày tạo: {new Date(process.created_at).toLocaleString()}</Card.Text>
                  <Card.Text>Người tạo: {process.teacher_id}</Card.Text>
                  <div className='d-flex flex-column'>
                    <Button
                      variant="success"
                      onClick={() => {
                        setSelectedProcessId(process.process_id);
                        setShowExamSelection(true); // Hiển thị modal danh sách bài thi
                      }}
                    >
                      Thêm bài thi
                    </Button>
                    <Button variant="danger" onClick={() => handleRemoveProcess(process.process_id)}>
                      Gỡ tiến trình
                    </Button>
                  </div>

                  
                </Card.Body>
              </Card>
          </>



            ))}
          </div>

          {/* Bài thi đã thêm vào tiến trình */}
          <div style={{ width: '74%' }}>
            {exams.length > 0 && (
              <div className="border rounded p-3">
                <h4>Bài thi đã thêm vào tiến trình</h4>
                <div style={{ display: 'flex', alignItems: 'center', margin: '10px', justifyContent: 'flex-start' }}>
                  {exams.map((exam, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <Card style={{ width: '200px' }}>
                        <Card.Body>
                          <Card.Title>{exam.exam_name}</Card.Title>
                          <Card.Text>Nhập tỷ lệ đạt yêu cầu</Card.Text>
                          <InputGroup className="mb-3" style={{width: "54px"}}>
                            <FormControl
                              placeholder="%"
                              aria-label="Tỷ lệ đạt yêu cầu"
                              aria-describedby="basic-addon2"
                              defaultValue="80" 
                              value={examRates[exam.exam_id] || 80}  // Hiển thị tỷ lệ đã lưu hoặc mặc định là 80
                  onChange={(e) => handleRateChange(exam.exam_id, e.target.value)}  // Cập nhật tỷ lệ khi thay đổi
                            />
                          </InputGroup>
                        </Card.Body>
                        <FontAwesomeIcon
                          style={{
                            fontSize: "1.5rem",
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            cursor: 'pointer',
                            color: 'red',
                          }}
                          icon={faTimes}
                          onClick={() => handleRemoveExam(exam)} // Gọi hàm gỡ bài thi
                        />
                      </Card>
                      <FontAwesomeIcon style={{ margin: '0 10px' }} icon={faAnglesRight} />
                    </div>
                  ))}
                </div>
                <div className='mx-3'>
      {/* Hiển thị nút "Lưu tiến trình" */}
      <Button onClick={handleSaveProgress} variant="primary">
        Lưu tiến trình
      </Button>
    </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Không có tiến trình nào.</p>
      )}

      {/* Modal hiển thị danh sách bài thi khi nhấn nút "Thêm bài thi" */}
      <Modal show={showExamSelection} onHide={handleCloseExamSelection}>
        <Modal.Header closeButton>
          <Modal.Title>Chọn bài thi để thêm vào tiến trình</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {examList.map((exam) => (
            <Button key={exam.exam_id} variant="secondary" onClick={() => handleAddExam(exam)}>
              {exam.exam_name}
            </Button>
          ))}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LearningProcess;
