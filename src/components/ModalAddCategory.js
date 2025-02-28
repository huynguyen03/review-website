import React, { useState } from "react";

const ModalAddCategory = ({ showModal, setShowModal, categories, onAddCategory }) => {
  const [newCategory, setNewCategory] = useState("");
  const [parentCategory, setParentCategory] = useState(""); // Lưu danh mục cha được chọn

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      alert("Vui lòng nhập tên danh mục.");
      return;
    }

    // Gửi dữ liệu danh mục mới về component cha
    onAddCategory({
      category_name: newCategory,
      parent_id: parentCategory || null, // Nếu không chọn danh mục cha thì để null
    });

    setNewCategory("");
    setParentCategory("");
    setShowModal(false);
  };

  return (
    showModal && (
      <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Thêm danh mục mới</h5>
              <button className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Danh mục cha (nếu có)</label>
              <select
                className="form-select mb-3"
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
              >
                <option value="">Không có danh mục cha</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>

              <label className="form-label">Tên danh mục</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên danh mục"
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
    )
  );
};

export default ModalAddCategory;
