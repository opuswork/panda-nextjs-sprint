import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './addArticle.module.css'; // AddArticle

function AddArticle() { // AddArticle
  const location = usePathname();
  const router = useRouter();
  const navigate = (path) => router.push(path);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


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

  // ✅ If logged out, show message and auto-redirect (hooks must not be conditional)
  useEffect(() => {
    if (!isLoggedIn) return;

    const timeoutId = setTimeout(() => {
      // logout: remove auth cookie then redirect
      document.cookie = 'user=; Max-Age=0; path=/';
      //document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      setIsLoggedIn(false);
      router.push('/auth');
    }, 10 * 60 * 1000); // 60 minutes (1 hour)

    return () => clearTimeout(timeoutId);
  }, [isLoggedIn, router]);


  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setImageBase64(base64String);
        setFormData((prevData) => ({
          ...prevData,
          image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleImageClick = () => {
    document.getElementById('image-input').click();
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setFormData((prevData) => ({
      ...prevData,
      image: null,
    }));
    document.getElementById('image-input').value = '';
  };


  const handleSubmitCancel = () => {
    navigate('/articles');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // validation
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!formData.author.trim()) {
      setError('작성자를 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // prepare data to send to API
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: formData.author.trim(),
        image: formData.image || null, // base64 string or null
      };

      console.log('[AddArticle] Submitting article:', {
        title: submitData.title,
        content: submitData.content.substring(0, 50) + '...',
        author: submitData.author,
        hasImage: !!submitData.image
      });

      const response = await fetch('/api/Articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AddArticle] HTTP error:', response.status, errorText);
        throw new Error(`게시글 등록 실패: ${errorText}`);
      }

      const result = await response.json();
      console.log('[AddArticle] Article created successfully:', result);
      
      // redirect to /articles when successful
      navigate('/articles');
    } catch (err) {
      console.error('[AddArticle] Error creating article:', err);
      setError(err.message || '게시글 등록에 실패했습니다. 다시 시도해주세요.');
      // stay on the current page(/articles/write) when failed
    } finally {
      setLoading(false);
    }
  };

  // if (!isLoggedIn) {
  //   return (
  //     <div className={styles.addArticleContainer}>
  //       <div className={styles.addArticleError}>
  //         <p>오랜시간 미 접속으로 인해 세션이 만료되었습니다.<br /> 자동으로 로그인 페이지로 이동합니다.</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (loading) {
    return (
      <div className={styles.addArticleContainer}>
        <div className={styles.addArticleLoading}>
          <p>게시글을 등록하는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.addArticleContainer}>
        <div className={styles.addArticleError}>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.addArticleContainer}> {/* AddArticle */}
      <div className={styles.addArticleWrapper}> {/* AddArticle */}
        <div className={styles.addArticleHeader}>
          <h1 className={styles.addArticleTitle}>게시글 쓰기</h1>
          <div className={styles.addArticleHeaderButtons}>
            <button 
              type="button" 
              className={styles.addArticleCancelBtn}
              onClick={handleSubmitCancel}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="button" 
              className={styles.addArticleSubmitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              등록
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.addArticleForm}>
          {error && (
            <div className={styles.addArticleError}>
              {error}
            </div>
          )}

          <div className={styles.addArticleField}>
            <label htmlFor="title" className={styles.addArticleLabel}> 
              *제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.addArticleInput}
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.addArticleField}> 
            <label htmlFor="author" className={styles.addArticleLabel}>
              *작성자
            </label>
            <input
              type="text"
              id="author"
              name="author"
              className={styles.addArticleInput}
              placeholder="작성자를 입력해주세요"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.addArticleField}>
            <label htmlFor="content" className={styles.addArticleLabel}>
              *내용
            </label>
            <textarea
              id="content"
              name="content"
              className={styles.addArticleTextarea}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              required
            />
          </div>

          <div className={styles.addArticleField}>
            <label className={styles.addArticleLabel}>이미지</label>
            <div className={styles.addArticleImageUpload}>
              <input
                type="file"
                id="image-input"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <div className={styles.addArticleImagePreview}>
                  <img src={imagePreview} alt="미리보기" />
                  <button
                    type="button"
                    className={styles.addArticleImageRemove}
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className={styles.addArticleImagePlaceholder}
                  onClick={handleImageClick}
                >
                  <span className={styles.addArticleImageIcon}>+</span>
                  <span className={styles.addArticleImageText}>이미지 등록</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddArticle;

