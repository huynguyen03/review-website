import React, { createContext, useState, useContext } from 'react';

// Tạo context để quản lý dữ liệu tìm kiếm
const SearchContext = createContext();

// Provider để cung cấp dữ liệu tìm kiếm
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query); // Cập nhật từ khóa tìm kiếm
  };

  return (
    <SearchContext.Provider value={{ searchQuery, handleSearch }}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook để sử dụng context tìm kiếm
export const useSearch = () => useContext(SearchContext);
