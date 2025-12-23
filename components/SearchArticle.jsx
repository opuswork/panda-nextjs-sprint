"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./SearchArticle.module.css";
import searchIcon from "../public/assets/icons/ic_search.svg";
import sortIcon from "../public/assets/icons/ic_sort.svg";

import { useRouter } from "next/navigation";


function SearchArticle({ 
    onSearch, 
    onClear,
}) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState("최신순");
    const dropdownRef = useRef(null);

    const handleSearchInputChange = (e) => {
        setSearchKeyword(e.target.value);
    };

    // Handle search submission
    const handleSearch = (keyword) => {
        const trimmedKeyword = keyword?.trim() || "";
        setSearchKeyword(trimmedKeyword);
        if (onSearch) {
            onSearch(trimmedKeyword);
        }
    };


    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(searchKeyword);
        }
    };

    // Handle search clear
    const handleSearchClear = () => {
        setSearchKeyword("");
        if (onClear) {
            onClear();
        }
    }; 

    const handleSortClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSortSelect = (option) => {
        setSelectedSort(option.label);
        setIsDropdownOpen(false);
        // Notify parent component of sort change
        if (onSortChange) {
            onSortChange(option.value);
        }
    };

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
        };

        if (isDropdownOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

  return (
    <>
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <button
            type="button"
            className={styles.searchIconButton}
            onClick={() => handleSearch(searchKeyword)}
            aria-label="검색"
          >
            <Image 
              src={searchIcon} 
              alt="Search" 
              width={20} 
              height={20}
              className={styles.searchIcon}
              loading="eager"
            />
          </button>
          <input
            type="text"
            placeholder="검색할 게시글을 입력해주세요"
            className={styles.searchInput}
            onChange={handleSearchInputChange}
            onKeyDown={handleSearchKeyPress}
            value={searchKeyword}
          />
            {searchKeyword && (
                <button 
                    className={styles.searchClearButton} 
                    onClick={handleSearchClear}
                    aria-label="검색어 지우기"
                >
                    ×
                </button>
            )}
        </div>
      </div>
    </>
  );
}

export default SearchArticle;