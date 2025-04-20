import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb } from "react-bootstrap"; // Để tạo đường dẫn (breadcrumb)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons"; // Icon tìm kiếm
import { useSearch } from "./SearchContext"; // Import hook sử dụng tìm kiếm

const HeaderContent = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const [section, setSection] = useState(""); // Lưu phần section trong URL
  const [sub, setSub] = useState(""); // Lưu phần sub nếu có trong URL

  // Mã chuyển đổi từ section thành tên hiển thị dễ hiểu
  const sectionLabels = {
    my_classrooms: "Lớp học của tôi",
    my_quiz: "Bài tập của tôi",
    manage_classrooms: "Quản lý lớp học",
    question_bank: "Ngân hàng câu hỏi",
    profile: "Hồ sơ cá nhân",
    exam: "Bài thi",
    home: "Trang chủ"
  };
  const subLabels = {
    statistic: "Thống kê",
  };

  const { searchQuery, handleSearch } = useSearch(); // Lấy dữ liệu tìm kiếm và hàm cập nhật từ context
  const [inputSearch, setInputSearch] = useState(searchQuery); // State lưu trữ từ khóa tìm kiếm trong input

  // Hàm xử lý khi người dùng thay đổi giá trị tìm kiếm
  const handleSearchChange = (e) => {
    setInputSearch(e.target.value);
  };

  // Hàm gọi handleSearch từ context khi người dùng nhấn tìm kiếm
  const handleSearchClick = () => {
    handleSearch(inputSearch); // Cập nhật tìm kiếm trong context
  };
  // Cập nhật phần section và sub khi URL thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get("section");
    const subParam = searchParams.get("sub"); // Lấy tham số 'sub'
    setSection(sectionParam); // Lưu phần section trong state
    setSub(subParam); // Lưu phần sub trong state
  }, [location]);

  // Hàm lấy breadcrumb từ URL hiện tại
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x); // Chia URL thành các phần
    return pathnames;
  };

  // Hàm xử lý điều hướng khi người dùng nhấn vào breadcrumb
  const handleBreadcrumbClick = (sectionKey, subKey) => {
    let path = `/users?section=${sectionKey}`; // Điều hướng tới đường dẫn với tham số section
    if (subKey) path += `&sub=${subKey}`; // Nếu có sub, thêm vào đường dẫn
    navigate(path); // Điều hướng đến đường dẫn tương ứng
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearchClick(); // Gọi handleSearchClick khi nhấn Enter
    }
  };

  return (
    <div className="flex-grow-1 p-2 m-2 mb-3">
      <div className="heading-content  d-flex text-center justify-content-between align-items-center">
        {/* Đường dẫn breadcrumb động */}
        <Breadcrumb className="d-flex align-items-center" style={{marginBottom: "0px"}}>
          <Breadcrumb.Item
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleBreadcrumbClick("home"); // Điều hướng về Trang chủ
            }}
          >
            Trang chủ
          </Breadcrumb.Item>

          {/* Hiển thị phần section nếu có */}
          {section && sectionLabels[section] && (
            <Breadcrumb.Item
              active
              href={"/"}
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(section, sub); // Điều hướng đến đường dẫn có tham số section và sub
              }}
            >
              {sectionLabels[section]} {/* Chuyển đổi section thành văn bản */}
            </Breadcrumb.Item>
          )}

          {/* Hiển thị phần sub nếu có */}
          {sub && subLabels[sub] && (
            <Breadcrumb.Item
              active
              onClick={(e) => {
                e.preventDefault();
                handleBreadcrumbClick(section, sub); // Điều hướng tới đường dẫn với cả section và sub
              }}
            >
              {subLabels[sub] } {/* Chuyển đổi sub thành văn bản */}
            </Breadcrumb.Item>
          )}
        </Breadcrumb>

        {/* Ô tìm kiếm */}
        {/* Ô tìm kiếm */}
        <div className="input-group" style={{ maxWidth: "300px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm..."
            value={inputSearch}
            onChange={handleSearchChange}
            style={{ width: "250px" }}
            onKeyDown={handleKeyDown} // Thêm sự kiện keydown cho ô nhập liệu
          />
          <button className="btn btn-primary" onClick={handleSearchClick}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
      </div>
    
  );
};

export default HeaderContent;
