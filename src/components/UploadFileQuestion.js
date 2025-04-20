import React, { useState, useEffect, useRef } from "react";
import { useQuestions } from "./QuestionContext";
import ModalAddCategory from "./ModalAddCategory";

import "../assets/styles/UploadFileQuestion.css"


const UploadFileQuestion = ({ teacherId, updateCategories }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null); // Tham chiếu đến input file
  const { fetchQuestions } = useQuestions(); // Lấy hàm fetchQuestions từ context
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [showModal, setShowModal] = useState(false); // Điều khiển modal
  const [loading, setLoading] = useState(false); // Kiểm soát trạng thái tải lên

  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  // 🔹 Fetch danh mục khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/get_categories.php?teacher_id=${teacherId}`);
      const data = await response.json();
      setCategories(data); // Cập nhật danh mục
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  // 🔹 Xử lý tải tệp lên
  const handleFileUpload = async () => {
    if (!file) {
      alert("Vui lòng chọn tệp!");
      return;
    }

    if (!selectedCategory) {
      alert("Vui lòng chọn danh mục!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("teacher_id", teacherId);
    formData.append("category_id", selectedCategory);

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/upload.php`, {
        method: "POST",
        body: formData,
      });

      console.log(response.data)
      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error("Server returned invalid JSON:", text);
        alert("Lỗi: Server trả về dữ liệu không hợp lệ!");
        return;
      }

      if (result.status === "success") {
        alert(result.message);
        fetchQuestions(teacherId); // Cập nhật danh sách câu hỏi
        // ✅ Reset file input sau khi tải lên thành công
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Xóa giá trị của input file
        }
      } else {
        throw new Error(result.message || "Lỗi không xác định");
      }
    } catch (error) {
      console.error("Lỗi khi tải tệp:", error);
      alert("Tải tệp lên thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (newCategory) => {
    console.log("Danh mục mới gửi lên:", newCategory);
  
    // Kiểm tra dữ liệu hợp lệ
    if (!newCategory || !newCategory.category_name.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }
  
    try {
      const response = await fetch(`${apiUrl}/add_category.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: teacherId,
          category_name: newCategory.category_name,  // Gửi tên danh mục
          parent_id: newCategory.parent_id || null,  // Nếu không có danh mục cha, gửi null
        }),
      });
  
      const result = await response.json();
  
      if (result.status === "success") {
        alert(result.message);
        console.log("Kiểm tra kiểu của updateCategories: ",typeof updateCategories);
        
        if (typeof updateCategories === "function") {
          updateCategories(); // Gọi hàm updateCategories để tải lại danh mục
          
        } 
        setShowModal(false); // Đóng modal
        fetchCategories(); // Cập nhật danh sách danh mục
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      alert("Thêm danh mục thất bại!");
    }
  };
  

  return (
    <div className="content-container">
      <h3 className="title">Tải tệp câu hỏi lên hệ thống</h3>
    <div className="mt-2 question-upload-container">
      <div className="mb-3 d-flex align-items-center ">
        {/* Dropdown danh mục */}
        <select
          className="form-select me-3 question-category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          {/* Chọn danh mục mặc định là danh mục đầu tiên */}
  {categories.length > 0 && (
    <option value={categories[0].category_id}>{categories[0].category_name}</option>
  )}

  {/* Hiển thị các danh mục còn lại */}
  {categories.slice(1).map((category) => (
    <option key={category.category_id} value={category.category_id}>
      {category.category_name}
    </option>
  ))}
        </select>
        {/* Nút thêm danh mục */}
        <button className="btn btn-outline-primary question-category-buttons" onClick={() => setShowModal(true)}>
          +
        </button>
        {/* Nút gỡ danh mục */}
    <button
      className="btn btn-outline-danger question-category-buttons"
      onClick={() => setSelectedCategory("")} // Gỡ danh mục khi nhấn nút "-"
    >
      -
    </button>
      </div>

      {/* Hiển thị Modal */}
      <ModalAddCategory
        showModal={showModal}
        setShowModal={setShowModal}
        categories={categories} // Truyền danh mục cha vào modal
        onAddCategory={handleAddCategory} // Hàm xử lý khi thêm danh mục mới
      />

      {/* Input file */}
      <input
        type="file"
        className="form-control mb-3 question-file-input"
        accept=".csv,.txt,.gift"
        onChange={handleFileChange}
        disabled={loading}
        ref={fileInputRef} // ✅ Gán ref để có thể reset input file sau khi tải lêny
      />
      
      {/* Nút tải lên */}
      <button className="btn btn-primary" onClick={handleFileUpload} disabled={loading}>
        {loading ? "Đang tải lên..." : "Tải lên"}
      </button>
    </div>
    </div>

  );
};

export default UploadFileQuestion;
