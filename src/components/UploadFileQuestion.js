import React, { useState, useEffect, useRef } from "react";
import { useQuestions } from "./QuestionContext";

const UploadFileQuestion = ({ teacherId }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null); // Tham chiếu đến input file
  const { fetchQuestions } = useQuestions(); // Lấy hàm fetchQuestions từ context
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("1");
  const [newCategory, setNewCategory] = useState(""); // Tên danh mục mới
  const [showModal, setShowModal] = useState(false); // Điều khiển modal
  const [loading, setLoading] = useState(false); // Kiểm soát trạng thái tải lên

  // 🔹 Fetch danh mục khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost/react_api/get_categories.php");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
      const response = await fetch("http://localhost/react_api/upload.php", {
        method: "POST",
        body: formData,
      });

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

  // 🔹 Xử lý thêm danh mục mới
  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Tên danh mục không được để trống!");
      return;
    }

    try {
      const response = await fetch("http://localhost/react_api/add_category.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_name: newCategory }),
      });
      const result = await response.json();

      if (result.status === "success") {
        alert(result.message);
        setNewCategory(""); // Reset input
        setShowModal(false); // Đóng modal

        // Cập nhật danh sách danh mục ngay sau khi thêm
        const res = await fetch("http://localhost/react_api/get_categories.php");
        if (!res.ok) throw new Error("Không thể tải danh mục mới");
        const data = await res.json();
        setCategories(data);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      alert("Thêm danh mục thất bại!");
    }
  };

  return (
    <div className="container mt-2" style={{ maxWidth: "100%" }}>
      <h3>Tải tệp câu hỏi lên hệ thống</h3>
      <div className="mb-3 d-flex align-items-center">
        {/* Dropdown danh mục */}
        <select
          className="form-select me-3"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
        {/* Nút thêm danh mục */}
        <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>
          +
        </button>
      </div>

      {/* Modal thêm danh mục */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Thêm danh mục mới</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tên danh mục"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleAddCategory}>
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input file */}
      <input
        type="file"
        className="form-control mb-3"
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
  );
};

export default UploadFileQuestion;
