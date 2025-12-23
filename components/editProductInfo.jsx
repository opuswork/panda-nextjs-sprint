"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { getProduct } from '@/app/api/products';
import styles from './registration.module.css';

// Next.js API Routes 사용
const API_URL = '/api/products';

// Prisma Category enum 값
const CATEGORIES = [
  'FASHION',
  'BEAUTY',
  'SPORTS',
  'ELECTRONICS',
  'HOME_INTERIOR',
  'HOUSEHOLD_SUPPLIES',
  'KITCHENWARE',
];

// 수정 성공 시 반환되는 데이터의 필드를 보기 좋게 변환하기 위한 맵
const FIELD_LABELS = {
    id: '상품 ID',
    name: '상품 이름',
    description: '상품 설명',
    category: '카테고리',
    price: '가격',
    stock: '재고',
    image: '이미지',
    productImage: '상품 이미지',
    tags: '태그',
    createdAt: '생성일',
    updatedAt: '수정일',
};

function EditProductInfo() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const navigate = (path) => router.push(path);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0], 
    price: 0,
    stock: 0,
    image: '',
    tags: '',
  });

  const [updatedProduct, setUpdatedProduct] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 상품 정보 불러오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        console.log('🔍 [EditProductInfo] Fetching product:', id);
        const product = await getProduct(id);
        
        console.log('📦 [EditProductInfo] Product data:', product);
        console.log('🏷️ [EditProductInfo] Product tags:', product.tags);
        console.log('🏷️ [EditProductInfo] Tags type:', typeof product.tags, 'Is Array?', Array.isArray(product.tags));
        
        // 태그 문자열 변환
        let tagsString = '';
        if (product.tags) {
          if (Array.isArray(product.tags)) {
            if (product.tags.length > 0) {
              tagsString = product.tags.map(tag => {
                if (typeof tag === 'object' && tag !== null) {
                  return tag.name || tag.id || String(tag);
                }
                return String(tag);
              }).filter(tag => tag && typeof tag === 'string' && tag.trim()).join(', ');
            }
          } else if (typeof product.tags === 'string') {
            tagsString = product.tags;
          }
        }
        
        console.log('🏷️ [EditProductInfo] Tags string:', tagsString);
        
        // 폼 데이터에 상품 정보 설정
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || CATEGORIES[0],
          price: product.price || 0,
          stock: product.stock || 0,
          image: product.images || product.productImage || '',
          tags: tagsString,
        });
        
        // 이미지 미리보기 설정
        if (product.images || product.productImage) {
          setImagePreview(product.images || product.productImage);
        }
      } catch (err) {
        console.error('[EditProductInfo] Error fetching product:', err);
        setError(err.message || '상품을 불러오는데 실패했습니다.');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    // 파일 입력 처리
    if (type === 'file' && files && files[0]) {
      const file = files[0];
      // 파일을 읽어서 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        // 이미지 URL을 formData에 저장
        setFormData((prevData) => ({
          ...prevData,
          image: reader.result, // 임시로 base64 사용
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        // price와 stock은 숫자로 변환
        [name]: (name === 'price' || name === 'stock') ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdatedProduct(null);
    setError(null);
    setUpdating(true);

    try {
      // 태그를 배열로 변환 (쉼표로 구분된 문자열을 배열로)
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      console.log('🏷️ [EditProductInfo] Tags input:', formData.tags);
      console.log('🏷️ [EditProductInfo] Tags array:', tagsArray);

      // API에 전송할 데이터 준비
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        productImage: formData.image || null,
        image: formData.image || null,
        tags: tagsArray, // 태그 배열 전송
      };

      console.log('[EditProductInfo] Submitting data:', submitData);

      // PATCH API 호출하여 상품 수정
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 [EditProductInfo] Response:', data);

      if (response.status === 200) {
        // 성공적으로 수정된 데이터를 상태에 저장하여 상세 정보 표시
        setUpdatedProduct(data);
      }
    } catch (err) {
      console.error('상품 수정 실패:', err);
      // 백엔드에서 받은 에러 메시지 표시
      setError(`상품 수정에 실패했습니다: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      if (response.status === 200) {
        alert('상품이 삭제되었습니다.');
        navigate('/products');
      }
    } catch (err) {
      console.error('상품 삭제 실패:', err);
      setError(`상품 삭제에 실패했습니다: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // 다시 수정하기 버튼 핸들러
  const handleReset = () => {
    setUpdatedProduct(null);
    setError(null);
  };

  if (fetchLoading) {
    return (
      <div className={styles.registr}>
        <div className={styles.registrTitle}>
          <h1 className={styles.resTitle}>상품 수정</h1>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registr}>
      {/* 수정 성공 시 수정된 정보만 표시 */}
      {updatedProduct ? (
        <>
          <div className={styles.registrTitle}>
            <h1 className={styles.resTitle}>수정된 정보</h1>
            <div className={styles.registrTitleButtons}>
              <button 
                className={styles.registrButton} 
                onClick={() => navigate('/registration')}
              >
                상품 등록
              </button>
              <div className={styles.registrTitleButtonsSecondary}>
                <button 
                  className={styles.registrButton} 
                  onClick={handleReset}
                  style={{ background: '#4F46E5' }}
                >
                  다시 수정
                </button>
                <button 
                  className={styles.registrButton} 
                  onClick={handleDelete}
                  style={{ background: '#DC2626' }}
                  disabled={updating || deleting}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
          
          {Object.entries(updatedProduct).map(([key, value]) => {
            // tags는 배열이므로 특별 처리
            if (key === 'tags' && Array.isArray(value)) {
              return (
                <div key={key}>
                  <label className={styles.label} htmlFor={`detail-${key}`}>
                    {FIELD_LABELS[key] || key}
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    id={`detail-${key}`}
                    value={value.map(tag => typeof tag === 'object' ? tag.name : tag).join(', ')}
                    readOnly
                  />
                </div>
              );
            }
            
            // 날짜 필드 처리
            if (key === 'createdAt' || key === 'updatedAt') {
              return (
                <div key={key}>
                  <label className={styles.label} htmlFor={`detail-${key}`}>
                    {FIELD_LABELS[key] || key}
                  </label>
                  <input
                    className={styles.input}
                    type="text"
                    id={`detail-${key}`}
                    value={new Date(value).toLocaleString()}
                    readOnly
                  />
                </div>
              );
            }
            
            // 일반 필드
            return (
              <div key={key}>
                <label className={styles.label} htmlFor={`detail-${key}`}>
                  {FIELD_LABELS[key] || key}
                </label>
                <input
                  className={styles.input}
                  type="text"
                  id={`detail-${key}`}
                  value={value || ''}
                  readOnly
                />
              </div>
            );
          })}
        </>
      ) : (
        <>
          <div className={styles.registrTitle}>
            <h1 className={styles.resTitle}>상품 수정</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={styles.registrButton} 
                onClick={() => navigate(`/products/${id}`)}
                style={{ background: '#D1D5DB' }}
                disabled={updating || deleting}
              >
                수정 취소
              </button>
              <button 
                className={styles.registrButton} 
                type="submit" 
                form="product-edit-form"
                disabled={updating || deleting}
              >
                {updating ? '수정 중...' : '수정 완료'}
              </button>
              <button 
                className={styles.registrButton} 
                onClick={handleDelete}
                style={{ background: '#DC2626' }}
                disabled={updating || deleting}
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>

          {/* 상품 수정 폼 */}
          <form id="product-edit-form" className={styles.productForm} onSubmit={handleSubmit}>
        <div>
          <label className={styles.label} htmlFor="name">상품 이름 (name)</label>
          <input 
            className={styles.input}
            type="text" 
            id="name"
            name="name" 
            placeholder="상품 이름을 입력하세요" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="description">상품 설명 (description)</label>
          <textarea 
            className={styles.input}
            id="description"
            name="description" 
            placeholder="상품 설명을 입력하세요" 
            value={formData.description} 
            onChange={handleChange} 
            rows="4"
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="category">카테고리 (category)</label>
          <select 
            className={styles.input}
            id="category"
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.label} htmlFor="price">가격 (price)</label>
          <input 
            className={styles.input}
            type="number" 
            id="price"
            name="price" 
            placeholder="가격을 입력하세요" 
            value={formData.price} 
            onChange={handleChange} 
            min="0"
            required 
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="stock">재고 (stock)</label>
          <input 
            className={styles.input}
            type="number" 
            id="stock"
            name="stock" 
            placeholder="재고 수량을 입력하세요" 
            value={formData.stock} 
            onChange={handleChange} 
            min="0"
            required 
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="image">상품 이미지 (image)</label>
          <input 
            className={styles.input}
            type="file" 
            id="image"
            name="image" 
            accept="image/*"
            onChange={handleChange}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={imagePreview} 
                alt="미리보기" 
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }} 
              />
            </div>
          )}
          <input 
            className={styles.input}
            type="text" 
            id="imageUrl"
            name="image" 
            placeholder="또는 이미지 URL을 입력하세요" 
            value={formData.image} 
            onChange={handleChange}
            style={{ marginTop: '10px' }}
          />
        </div>

        <div>
          <label className={styles.label} htmlFor="tags">태그 (tags)</label>
          <input 
            className={styles.input}
            type="text" 
            id="tags"
            name="tags" 
            placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 할인, 신상, 겨울옷)" 
            value={formData.tags || ''} 
            onChange={handleChange}
          />
          <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
            여러 태그를 입력하려면 쉼표(,)로 구분하세요
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>
              디버그: tags 값 = "{formData.tags}" (길이: {formData.tags?.length || 0})
            </p>
          )}
        </div>
      </form>
      
      {/* 에러 메시지 표시 */}
      {error && <p className={styles.errorMessage}>{error}</p>}
        </>
      )}
    </div>
  );
}

export default EditProductInfo;

