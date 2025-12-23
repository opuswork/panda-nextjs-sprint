"use client";
import React from "react";
import Image from "next/image";
import styles from "./pagination.module.css";
import arrowLeft from "../public/assets/icons/arrow_left.svg";
import arrowRight from "../public/assets/icons/arrow_right.svg";

function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {

  const handlePageClick = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // 최대 5개의 페이지 번호만 표시하는 로직
  const getVisiblePages = () => {
    const maxVisible = 5;
    const pages = [];
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 5개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 앞뒤 2개씩 표시
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // 시작 페이지가 1에 가까우면 끝을 5로 맞춤
      if (startPage === 1) {
        endPage = Math.min(maxVisible, totalPages);
      }
      // 끝 페이지가 마지막에 가까우면 시작을 마지막-4로 맞춤
      else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={styles.pagination}>
      <button className={styles.arrowButton} disabled={currentPage === 1} onClick={() => handlePageClick(currentPage - 1)}>
        <Image
          src={arrowLeft}
          alt="Previous page"
          width={20}
          height={20}
        />
      </button>
      
      <div className={styles.pageNumbers}>
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`${styles.pageButton} ${
              page === currentPage ? styles.active : ""
            }`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}
      </div>
      
      <button
        className={styles.arrowButton}
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
      >
        <Image
          src={arrowRight}
          alt="Next page"
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}

export default Pagination;