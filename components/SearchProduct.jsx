"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./SearchProduct.module.css";
import searchIcon from "../public/assets/icons/ic_search.svg";
import sortIcon from "../public/assets/icons/ic_sort.svg";

import { useRouter, usePathname } from "next/navigation";


function SearchProduct({ 
    showRegisterButtonOnly = false,  
    onSearch, 
    onClear,
    onSortChange,
    initialSort = "최신순"
}) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSort, setSelectedSort] = useState(initialSort);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // ✅ Get the current pathname
    const location = usePathname();

    // ✅ State to track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleRegisterClick = () => {
      router.push(isLoggedIn ? "/registration" : "/auth");
    };  // ✅ Handle register click

    // ✅ Check for 'user' cookie on mount
    useEffect(() => {
        const checkLoginStatus = () => {
            const getCookie = (name) => {
                const value = `; ${document.cookie}`;
                const parts = value.split(`; ${name}=`);
                if (parts.length === 2) return parts.pop().split(';').shift();
            };
            
            // Check if 'user' cookie exists
            const userCookie = getCookie('user');
            setIsLoggedIn(!!userCookie); // Set true if cookie exists, false otherwise
        };

        checkLoginStatus();
        
    }, [location]); // Re-check when the user navigates to a new page    


    // Sort options mapping: Korean display -> API value
    const sortOptions = [
        { label: "최신순", value: "recent" },
        { label: "좋아요순", value: "likes" }
    ];

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

    // 외부 클릭 시 드롭다운 닫기 (✅ Only for mobile screen)
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

    if (showRegisterButtonOnly) {
      // ✅ Show a single action button; behavior depends on login status at mobile(499px) screen only
      return !isLoggedIn ? (
        <button
          type="button"
          className={styles.registerButton}
          onClick={() => router.push("/auth")}
        >
          상품 등록하기
        </button>
      ) : (
        <button
          type="button"
          className={styles.registerButton}
          onClick={() => router.push("/registration")}
        >
          상품 등록하기
        </button>
      );
    }

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
            placeholder="검색할 상품을 입력해주세요"
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
          {/* Mobile Sort Button */}
          <div className={styles.mobileSortWrapper} ref={dropdownRef}>
            <button 
              className={styles.sortButton}
              onClick={handleSortClick}
              aria-label="정렬"
            >
              <Image 
                src={sortIcon} 
                alt="정렬" 
                width={48} 
                height={48}
                className={styles.sortIcon}
                loading="eager"
              />
            </button>
            {isDropdownOpen && (
              <div className={styles.sortDropdown}>
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.sortOption} ${
                      selectedSort === option.label ? styles.active : ""
                    }`}
                    onClick={() => handleSortSelect(option)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <button 
            className={styles.desktopRegisterButton} 
            onClick={handleRegisterClick}
        >
            상품 등록하기
        </button>
        <div className={styles.desktopSortWrapper} ref={dropdownRef}>
          <button 
            className={styles.sortSelect}
            onClick={handleSortClick}
          >
            {selectedSort}
          </button>
          {isDropdownOpen && (
            <div className={styles.sortDropdown}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`${styles.sortOption} ${
                    selectedSort === option.label ? styles.active : ""
                  }`}
                  onClick={() => handleSortSelect(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchProduct;