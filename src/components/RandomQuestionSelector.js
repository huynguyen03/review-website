import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

const RandomQuestionSelector = ({ categories, onAddRandomQuestions }) => {
  const [randomQuestions, setRandomQuestions] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});
  const [visibleCategories, setVisibleCategories] = useState([]);

  useEffect(() => {
    // Lọc ra danh mục con của ID 2 (các danh mục có ID 3, 4, 5, 6)

    const defaultCategories = categories.filter(
      (category) => [3, 4, 5, 6].includes(Number(category.category_id))
    );
    setVisibleCategories(defaultCategories);

    // Khởi tạo danh mục được chọn
    const initialSelectedCategories = {};
    defaultCategories.forEach((category) => {
      initialSelectedCategories[category.category_id] = category.category_id;
    });
    setSelectedCategories(initialSelectedCategories);
  }, [categories]);

  const handleRandomQuestionChange = (categoryId, count) => {
    setRandomQuestions((prev) => ({
      ...prev,
      [categoryId]: parseInt(count, 10) || 0,
    }));
  };

  const handleCategoryChange = (rowId, newCategoryId) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [rowId]: newCategoryId,
    }));
  };
  const handleRemoveCategoryRow = (categoryId) => {
    setVisibleCategories((prev) => prev.filter((cat) => cat.category_id !== categoryId));
  };

  const handleAddCategoryRow = () => {
    // Lọc ra danh mục chưa hiển thị
    const remainingCategories = categories.filter(
      (cat) => !visibleCategories.some((vc) => vc.category_id === cat.category_id)
    );

    if (remainingCategories.length > 0) {
      setVisibleCategories([...visibleCategories, remainingCategories[0]]);
    } else {
      alert("Không còn danh mục nào để thêm!");
    }
  };

  const handleAddRandomQuestions = () => {
    
  
    // Chuẩn bị dữ liệu ma trận câu hỏi để gửi lên component cha
    const questionMatrix = visibleCategories.map((category) => ({
      category_id: selectedCategories[category.category_id] || category.category_id,
      category_name: categories.find(cat => cat.category_id === (selectedCategories[category.category_id] || category.category_id))?.category_name || "",
      question_count: randomQuestions[category.category_id] || 0,
    }));
  
    onAddRandomQuestions(questionMatrix); // Truyền dữ liệu lên component cha
  };
  

  const totalQuestions = Object.values(randomQuestions).reduce((sum, num) => sum + num, 0);

  return (
    <Container>
      <h5 className="mt-4">Thêm câu hỏi ngẫu nhiên theo ma trận</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Danh mục</th>
            <th>Số lượng câu hỏi</th>
            <th></th> {/* Cột trống cho mục tương tác */}
          </tr>
        </thead>
        <tbody>
          {visibleCategories.map((category, index) => (
            <tr key={category.category_id}>
              <td>
                <Form.Select
                  value={selectedCategories[category.category_id] || category.category_id}
                  onChange={(e) => handleCategoryChange(category.category_id, e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={randomQuestions[category.category_id] || ""}
                  min="0"
                  onChange={(e) => handleRandomQuestionChange(category.category_id, e.target.value)}
                  placeholder="Nhập số câu hỏi"
                />
              </td>
              {/* Chỉ hiển thị nút + ở dòng cuối cùng */}
              <td>

                  {/* Nút xoá hàng (-) */}
              <Button className="mx-2" variant="danger" size="sm" onClick={() => handleRemoveCategoryRow(category.category_id)}>
              <FontAwesomeIcon icon={faMinus} />
              </Button>

              {index === visibleCategories.length - 1 && (
                <Button variant="success" size="sm" onClick={handleAddCategoryRow}>
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Row className="mt-2">
        <Col className="text-end">
          <strong>Tổng số câu hỏi: {totalQuestions}</strong>
        </Col>
      </Row>
      <Button variant="primary" className="mt-3" onClick={handleAddRandomQuestions}>
        Lưu ma trận câu hỏi ngẫu nhiên
      </Button>
    </Container>
  );
};

export default RandomQuestionSelector;
