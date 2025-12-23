"use client";
import React from "react";
import Image from "next/image";
import SearchProduct from "./SearchProduct";
import Pagination from "./pagination";
import styles from "./SecondHandMarket.module.css";
import defaultProductImage from "../public/assets/products/default.svg";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";


function SecondHandMarket() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const PAGE_SIZE = 10;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [orderBy, setOrderBy] = useState("recent");
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

       // Fetch products with pagination
       useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('[SecondHandMarket] Fetching products...', {
                    page: currentPage,
                    pageSize: PAGE_SIZE,
                    orderBy: orderBy,
                    keyword: searchKeyword
                });
                // Build URL with proper encoding
                const url = new URL('/api/products', window.location.origin);
                url.searchParams.set('page', String(currentPage));
                url.searchParams.set('pageSize', String(PAGE_SIZE));
                url.searchParams.set('orderBy', orderBy);
                if (searchKeyword) {
                    url.searchParams.set('keyword', searchKeyword);
                }
                
                console.log('[SecondHandMarket] Fetching URL:', url.toString());
                
                const result = await fetch(url.toString(), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'omit'
                });
                const data = await result.json();
                console.log('[SecondHandMarket] Products result:', data);
                
                if (data && typeof data === 'object' && Array.isArray(data.products)) {
                    const products = data.products;
                    const totalCount = data.totalCount || products.length;
                    console.log('[SecondHandMarket] Items count:', products.length, ', Total count:', totalCount);
                    console.log('[SecondHandMarket] Setting products:', products.length, 'items');
                    if (products.length > 0) {
                        console.log('[SecondHandMarket] First product sample:', products[0]);
                    }
                    setProducts(products);
                    const calculatedTotalPages = Math.ceil(totalCount / PAGE_SIZE);
                    console.log('[SecondHandMarket] Setting totalPages:', calculatedTotalPages, '(total:', totalCount, ', pageSize:', PAGE_SIZE, ')');
                    setTotalPages(calculatedTotalPages);
                } else {
                    console.error('[SecondHandMarket] Invalid response format:', data);
                    console.error('[SecondHandMarket] Result type:', typeof data);
                    setProducts([]);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("[SecondHandMarket] Error fetching products:", error);
                setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
                setProducts([]);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage, orderBy, searchKeyword]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle search submission
    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        setCurrentPage(1);
        setIsSearching(!!keyword);
    };

    // Handle search clear
    const handleSearchClear = () => {
        setSearchKeyword("");
        setIsSearching(false);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setOrderBy(e.target.value);
        setCurrentPage(1);
    };

    const handleMobileSortClick = (value) => {
        setOrderBy(value);
        setCurrentPage(1);
        // Hide mobile dropdown
        setMobileDropdownOpen(false);
    };


  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>판매 중인 상품</h1>
            <div className={styles.mobileRegisterButton}>
              <SearchProduct showRegisterButtonOnly={true} />
            </div>
          </div>
          <div className={styles.searchSection}>
            <SearchProduct 
              onSearch={handleSearch}
              onClear={handleSearchClear}
              onSortChange={(sortValue) => {
                setOrderBy(sortValue);
                setCurrentPage(1);
              }}
              initialSort={orderBy === "recent" ? "최신순" : "좋아요순"}
            />
          </div>
        </div>
        
        <div className={styles.productsGrid}>
          {loading ? (
              <div className={styles.loading}>
                  <p>상품을 불러오는 중...</p>
              </div>
          ) : error ? (
              <div className={styles.errorMessage}>
                  <p><strong>{error}</strong></p>
              </div>
          ) : products.length === 0 ? (
              isSearching ? (
                  <div className={styles.noResults}>검색 결과가 없습니다.</div>
              ) : (
                  <div className={styles.noResults}>
                      <p>등록된 상품이 없습니다.</p>
                  </div>
              )
          ) : (
          <>
            {products.map((product, index) => (
              <div key={index} className={styles.productCard} onClick={() => router.push(`/products/${product.id}`)}>
                <div className={styles.productImage}>
                  <Image
                    src={defaultProductImage}
                    alt={product.name}
                    width={240}
                    height={240}
                    className={styles.image}
                    loading="eager"
                  />
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                  <div className={styles.productLikes}>
                    <span className={styles.heartIcon}>♡</span>
                    <span>{product.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
      )}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}

export default SecondHandMarket;