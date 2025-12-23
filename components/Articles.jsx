"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SearchArticle from './SearchArticle';
import Pagination from './pagination';
import authorIcon from '../public/assets/icons/ic_profile.svg';
import sortIcon from '../public/assets/icons/ic_sort.svg';
import likeIcon from '../public/assets/icons/heart-icon.svg';
import styles from './Articles.module.css';
import Image from 'next/image';
import defaultArticleImage from '../public/assets/products/default.svg';

// ✅ FIXED: Updated helper function to allow Base64
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return null;

    // 1. Allow Base64 Data URLs (This was missing)
    if (imagePath.startsWith('data:')) {
        return imagePath;
    }

    // 2. Replace /src/assets with /assets for Next.js public folder
    if (imagePath.startsWith('/src/assets')) {
        return imagePath.replace('/src/assets', '/assets');
    }

    // 3. If it's already a valid path, use it
    if (imagePath.startsWith('/assets') || imagePath.startsWith('http')) {
        return imagePath;
    }

    // 4. Fallback: If it's not empty but doesn't match above, try returning it anyway
    // (Useful if your DB stores just the filename like 'image.png')
    if (imagePath.length > 0) {
        return imagePath;
    }

    return null;
};

function Articles() {
    const router = useRouter();
    const location = usePathname();
    const [articles, setArticles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [sortOrder, setSortOrder] = useState("recent");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef(null);
    const PAGE_SIZE = 10;


    // ✅ State to track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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



    
    // Fetch articles with pagination
    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('[Articles] Fetching articles...', {
                    page: currentPage,
                    pageSize: PAGE_SIZE,
                    orderBy: sortOrder,
                    keyword: searchKeyword
                });
                // Build URL with proper encoding using URLSearchParams
                const params = new URLSearchParams();
                params.set('page', String(currentPage));
                params.set('pageSize', String(PAGE_SIZE));
                params.set('orderBy', sortOrder);
                if (searchKeyword) {
                    params.set('keyword', searchKeyword);
                }
                
                const apiUrl = `/api/Articles?${params.toString()}`;
                console.log('[Articles] Fetching URL:', apiUrl);
                
                const result = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'omit'
                });
                const data = await result.json();
                console.log('[Articles] Articles result:', data);
                
                // { articles: [...], totalCount: ... } format returned
                if (data && typeof data === 'object' && Array.isArray(data.articles)) {
                    const articlesList = data.articles;
                    const count = data.totalCount || articlesList.length;
                    console.log('[Articles] Items count:', articlesList.length, ', Total count:', count);
                    // check author field of the first article for debugging
                    if (articlesList.length > 0) {
                        console.log('[Articles] First article author:', articlesList[0].author, 'Full article:', articlesList[0]);
                    }
                    setArticles(articlesList);
                    setTotalCount(count);
                    const calculatedTotalPages = Math.ceil(count / PAGE_SIZE);
                    console.log('[Articles] Setting totalPages:', calculatedTotalPages, '(total:', count, ', pageSize:', PAGE_SIZE, ')');
                    setTotalPages(calculatedTotalPages);
                } 
                // direct array response (backward compatibility: if the backend returns an array directly, for backward compatibility, can be used for backward compatibility but not recommended because it's not the standard format and can be affected to the performance) 
                // else if (Array.isArray(result)) {
                //     console.log('[Articles] Direct array response:', result.length, 'items');
                //     setArticles(result);
                //     setTotalCount(result.length);
                //     const calculatedTotalPages = Math.ceil(result.length / PAGE_SIZE);
                //     setTotalPages(calculatedTotalPages);
                // } 
                else {  // invalid response format - set state to empty array and total count to 0 and total pages to 1
                    console.error('[Articles] Invalid response format:', data);
                    setArticles([]);
                    setTotalCount(0);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("[Articles] Error fetching articles:", error);
                setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
                setArticles([]);
                setTotalCount(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [currentPage, sortOrder, searchKeyword]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearch = (keyword) => {
        setSearchKeyword(keyword);
        setCurrentPage(1);
    };

    const handleSearchClear = () => {
        setSearchKeyword("");
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    const handleSortSelect = (value) => {
        setSortOrder(value);
        setCurrentPage(1);
        setShowSortDropdown(false);
    };

    // close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
                setShowSortDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}`;
    };

    return (
        <main className={styles.articlesMain}>
            <section className={styles.articlesSection}>
                <div className={styles.articlesHeader}>
                    <h2 className={styles.articlesTitle}>
                        게시글 
                        {totalCount > 0 && (
                            <span className={styles.articlesCount}>[전체 글수: {totalCount}]</span>
                        )}
                    </h2>
                    {!isLoggedIn ? (
                        <button 
                            className={styles.articlesWriteButton}
                            onClick={() => router.push('/auth')}
                        >
                            글쓰기
                        </button>
                    ) : (
                        <button 
                            className={styles.articlesWriteButton}
                            onClick={() => router.push('/articles/addArticle')}
                        >
                            글쓰기
                        </button>
                    )}
                </div>

                <div className={styles.articlesControls}>
                    <div className={styles.articlesSearchWrapper}>
                        <SearchArticle onSearch={handleSearch} onClear={handleSearchClear} />
                    </div>
                    {/* Desktop Select */}
                    <select 
                        className={`${styles.articlesSortSelect} ${styles.desktopOnly}`}
                        value={sortOrder}
                        onChange={handleSortChange}
                    >
                        <option value="recent">최신순</option>
                        <option value="oldest">오래된순</option>
                    </select>
                    {/* Mobile Sort Button */}
                    <div className={`${styles.articlesSortMobile} ${styles.mobileOnly}`} ref={sortDropdownRef}>
                        <button 
                            className={styles.articlesSortButton}
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            aria-label="정렬"
                        >
                            <Image src={sortIcon} alt="정렬" width={45} height={45} />
                        </button>
                        {showSortDropdown && (
                            <div className={styles.articlesSortDropdown}>
                                <button 
                                    className={`${styles.sortOption} ${sortOrder === 'recent' ? styles.active : ''}`}
                                    onClick={() => handleSortSelect('recent')}
                                >
                                    최신순
                                </button>
                                <button 
                                    className={`${styles.sortOption} ${sortOrder === 'oldest' ? styles.active : ''}`}
                                    onClick={() => handleSortSelect('oldest')}
                                >
                                    오래된순
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.articlesList}>
                    {loading ? (
                        <div className={styles.articlesLoading}>
                            <p>게시글을 불러오는 중...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.articlesError}>
                            <p><strong>{error}</strong></p>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className={styles.articlesEmpty}>
                            <p>등록된 게시글이 없습니다.</p>
                        </div>
                    ) : (
                        articles.map((article) => (
                            <Link 
                                key={article.id} 
                                href={`/articles/${article.id}`}
                                className={styles.articleCard}
                            >
                                <div className={styles.articleContent}>
                                    <div className={styles.articleRowTop}>
                                        <h3 className={styles.articleTitle}>{article.title || '제목 없음'}</h3>
                                    </div>
                                    <div className={styles.articleRowBottom}>
                                        <span className={styles.authorProfileIcon}>
                                            <Image src={authorIcon} alt="작성자" width={16} height={16} />
                                        </span>
                                        <span className={styles.articleAuthor}>{article.author || '익명'}</span>
                                        <span className={styles.articleDate}>{formatDate(article.createdAt)}</span>
                                    </div>
                                </div>
                                <div className={styles.articleMeta}>
                                    <div className={styles.articleImageWrapper}>
                                        <Image 
                                            src={normalizeImagePath(article.image) || defaultArticleImage} 
                                            alt={article.title || '게시글 이미지'}
                                            className={styles.articleImage}
                                            width={120}
                                            height={80}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                            loading="eager"
                                            style={{ width: '100%', height: 'auto' }} // this is for < 1199px
                                        />
                                    </div>
                                    <span className={styles.articleLikes}>
                                        <Image src={likeIcon} alt="좋아요" width={16} height={16} /> {article.favoriteCount || 0}
                                    </span>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                {totalPages > 0 && (
                    <div className={styles.articlesPagination}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}

export default Articles;

