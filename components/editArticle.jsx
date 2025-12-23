'use client'
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './editArticle.module.css';

function EditArticle() {
  const params = useParams();
  const articleId = params.articleId || params.id; 

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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Article by articleId
  useEffect(() => {
    if (!articleId) return;

    const fetchArticle = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        console.log('[EditArticle] Fetching article:', articleId);
        
        // ✅ Correct API Path with Capital 'A'
        const res = await fetch(`/api/Articles/${articleId}`);
        
        if (!res.ok) throw new Error("Failed to load article");

        const article = await res.json();
        console.log('[EditArticle] Article fetched:', article);
        
        setFormData({
          title: article.title || '',
          content: article.content || '',
          author: article.author || '',
          image: article.image || null,
        });
        
        // if article has image, set image preview
        if (article.image) {
          setImagePreview(article.image);
          setImageBase64(article.image);
        }
        
      } catch (err) {
        console.error('[EditArticle] Error:', err);
        setError(err.message || '게시글을 불러오는데 실패했습니다.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

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
    navigate(`/articles/${articleId}`);
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

      console.log('[EditArticle] Updating article:', {
        articleId,
        title: submitData.title
      });

      // ✅ FIX: Use fetch with PATCH method instead of importing server function
      const res = await fetch(`/api/Articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) {
        throw new Error('Failed to update article');
      }

      console.log('[EditArticle] Article updated successfully');
      
      // redirect to view page when successful
      navigate(`/articles/${articleId}`);

    } catch (err) {
      console.error('[EditArticle] Error updating article:', err);
      setError(err.message || '게시글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className={styles.editArticleContainer}>
        <div className={styles.editArticleLoading}>
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className={styles.editArticleContainer}>
        <div className={styles.editArticleError}>
          <p><strong>{error}</strong></p>
          <button onClick={() => navigate('/articles')} className={styles.backButton}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editArticleContainer}>
      <div className={styles.editArticleWrapper}>
        <div className={styles.editArticleHeader}>
          <h1 className={styles.editArticleTitle}>게시글 수정</h1>
            <div className={styles.editArticleHeaderButtons}>
            <button 
                type="button" 
                className={styles.editArticleCancelBtn}
                onClick={handleSubmitCancel}
                disabled={loading}
              >
                취소
            </button>          
            <button 
              type="button" 
              className={styles.editArticleSubmitBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              수정
            </button>
            </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.editArticleForm}>
          {error && (
            <div className={styles.editArticleError}>
              {error}
            </div>
          )}

          <div className={styles.editArticleField}>
            <label htmlFor="title" className={styles.editArticleLabel}>
              *제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={styles.editArticleInput}
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.editArticleField}>
            <label htmlFor="author" className={styles.editArticleLabel}>
              *작성자
            </label>
            <input
              type="text"
              id="author"
              name="author"
              className={styles.editArticleInput}
              placeholder="작성자를 입력해주세요"
              value={formData.author}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.editArticleField}>
            <label htmlFor="content" className={styles.editArticleLabel}>
              *내용
            </label>
            <textarea
              id="content"
              name="content"
              className={styles.editArticleTextarea}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              required
            />
          </div>

          <div className={styles.editArticleField}>
            <label className={styles.editArticleLabel}>이미지</label>
            <div className={styles.editArticleImageUpload}>
              <input
                type="file"
                id="image-input"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <div className={styles.editArticleImagePreview}>
                  <img src={imagePreview} alt="미리보기" />
                  <button
                    type="button"
                    className={styles.editArticleImageRemove}
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className={styles.editArticleImagePlaceholder}
                  onClick={handleImageClick}
                >
                  <span className={styles.editArticleImageIcon}>+</span>
                  <span className={styles.editArticleImageText}>이미지 등록</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticle;