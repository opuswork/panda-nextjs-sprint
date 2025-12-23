"use client";
import { useState } from "react";
import styles from './registration.module.css';
import defaultProductImage from '../public/assets/products/default.svg';
import { useRouter } from 'next/navigation';
const API_URL = '/api/products';    
// Next.js API Routes 사용 브라우저에서 포트번호로 직접 호출하면 CORS 오류가 발생하므로 API Routes 사용
// 현재 다른 Cursor의 Terminal에서 실행하고 있으므로 http://localhost:3000/products 로 직접 호출하면 CORS 오류가 발생하므로 API Routes 사용
import Image from 'next/image';
import { showError, hideError } from './registration_validate';

const CATEGORIES = [
  'FASHION',
  'BEAUTY',
  'SPORTS',
  'ELECTRONICS',
  'HOME_INTERIOR',
  'HOUSEHOLD_SUPPLIES',
  'KITCHENWARE',
];

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

function Registration() {

    const router = useRouter(); // Next.js 라우터 사용
    const navigate = () => router.push('/products');

    const [formData, setFormData] = useState({
      name: '',
      description: '',
      category: '', 
      price: '',
      stock: '',
      image: '',
      tags: '',
    });
  
    const [registeredProduct, setRegisteredProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
  
    const handleChange = (e) => {
      const { name, value, type, files } = e.target;
      
      if (type === 'file' && files && files[0]) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
          setFormData((prevData) => ({
            ...prevData,
            image: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData((prevData) => ({
          ...prevData,
          [name]: (name === 'price' || name === 'stock') 
            ? (value === '' ? '' : Number(value)) 
            : value,
        }));
      }
    };
  
    // Validate form data using React state
    const validateFormData = () => {
      let isValid = true;
      
      // 상품명 검증
      if (!formData.name.trim()) {
        showError('itemName', 'productNameVarError', '상품명을 입력해주세요.');
        isValid = false;
      } else {
        hideError('itemName', 'productNameVarError');
      }

      // 상품 설명 검증
      if (!formData.description.trim()) {
        showError('itemIntro', 'productIntroError', '상품 상세 정보를 입력해주세요.');
        isValid = false;
      } else {
        hideError('itemIntro', 'productIntroError');
      }

      // 가격 검증
      const priceNum = Number(formData.price);
      if (!formData.price || priceNum <= 0) {
        showError('itemPrice', 'productPriceError', '0보다 큰 값을 입력해야 합니다.');
        isValid = false;
      } else {
        hideError('itemPrice', 'productPriceError');
      }

      // 재고 검증
      const stockNum = Number(formData.stock);
      if (!formData.stock || stockNum <= 0) {
        showError('stock', 'productStockError', '0보다 큰 값을 입력해야 합니다.');
        isValid = false;
      } else {
        hideError('stock', 'productStockError');
      }

      // 카테고리 검증
      if (!formData.category) {
        showError('category', 'productCategoryError', '카테고리를 선택해주세요.');
        isValid = false;
      } else {
        hideError('category', 'productCategoryError');
      }

      // 태그 검증
      if (!formData.tags.trim()) {
        showError('itemTag', 'productTagError', '태그를 입력해주세요.');
        isValid = false;
      } else {
        hideError('itemTag', 'productTagError');
      }

      return isValid;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Validate form using React state
      if (!validateFormData()) {
        setError('입력한 정보를 확인해주세요.');
        return false;
      }
      
      setRegisteredProduct(null);
      setError(null);
      setLoading(true);

      try {
        const tagsArray = formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          : [];
  
        console.log('[Registration] Tags input:', formData.tags);
        console.log('[Registration] Tags array:', tagsArray);
  
        // API에 전송할 데이터 준비
        const submitData = {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          productImage: formData.image || null,
          image: formData.image || null,
          tags: tagsArray, // 태그 배열 전송
        };
  
        console.log('[Registration] Submitting data:', submitData);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        });
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // If not JSON, get text for error message
          const text = await response.text();
          console.error('[Registration] Non-JSON response:', text.substring(0, 200));
          throw new Error(`서버 오류 (${response.status}): ${response.statusText}`);
        }
        
        console.log('[Registration] Response:', data);

        if (response.ok && response.status === 201) {
          setRegisteredProduct(data);
          setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            stock: '',
            image: '',
            tags: '',
          });
          setImagePreview(null);
        } else {
          throw new Error(data.message || `상품 등록에 실패했습니다. (${response.status})`);
        }
      } catch (err) {
        console.error('상품 등록 실패:', err);
  
        setError(`상품 등록에 실패했습니다: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
  
    const handleReset = () => {
      setRegisteredProduct(null);
      setError(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        image: '',
        tags: '',
      });
      setImagePreview(null);
    };
  
    // validate form
    const isFormValid = () => {
      const priceNum = Number(formData.price);
      const stockNum = Number(formData.stock);
      return (
        formData.name.trim() !== '' &&
        formData.description.trim() !== '' &&
        priceNum > 0 &&
        stockNum > 0
      );
    };

    return (
        <>
            <div className={styles.registr}>
            {/* show form data after sucessfully submitted */}
            {registeredProduct ? (
                <>
                <div className={styles.registrTitle}>
                    <h1 className={styles.resTitle}>상품 상세 정보</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className={styles.registrButton} 
                        onClick={() => navigate('/items')}
                        style={{ background: '#6B7280' }}
                    >
                        목록으로
                    </button>
                    <button 
                        className={styles.registrButton} 
                        onClick={handleReset}
                    >
                        상품 등록
                    </button>
                    </div>
                </div>
                
                {Object.entries(registeredProduct).map(([key, value]) => {
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
                    <h1 className={styles.resTitle}>상품 등록 하기</h1>
                    <button 
                    className={styles.registrButton} 
                    type="submit" 
                    form="product-form"
                    disabled={loading}
                    >
                    {loading ? '등록 중...' : '등록'}
                    </button>
                </div>

                {/* product registration form */}
                <form id="product-form" className={styles.productForm} onSubmit={handleSubmit} action="#" method="post">
                <div>
                <label className={styles.label} htmlFor="itemName">상품 이름 (name)</label>
                <input 
                    className={styles.input}
                    type="text" 
                    id="itemName"
                    name="name" 
                    placeholder="상품 이름을 입력하세요" 
                    value={formData.name} 
                    onChange={handleChange}
                    onBlur={() => {
                      if (!formData.name.trim()) {
                        showError('itemName', 'productNameVarError', '상품명을 입력해주세요.');
                      } else {
                        hideError('itemName', 'productNameVarError');
                      }
                    }} 
                />
                <div id="productNameVarError" className={styles.errorMessage}></div>
                </div>

                <div>
                <label className={styles.label} htmlFor="itemIntro">상품 설명 (description)</label>
                <textarea 
                    className={styles.input}
                    id="itemIntro"
                    name="description" 
                    placeholder="상품 설명을 입력하세요" 
                    value={formData.description} 
                    onChange={handleChange}
                    onBlur={() => {
                      if (!formData.description.trim()) {
                        showError('itemIntro', 'productIntroError', '상품 상세 정보를 입력해주세요.');
                      } else {
                        hideError('itemIntro', 'productIntroError');
                      }
                    }}
                    rows="4"
                />
                <div id="productIntroError" className={styles.errorMessage}></div>
                </div>

                <div>
                <label className={styles.label} htmlFor="category">카테고리 (category)</label>
                <select 
                    className={styles.input}
                    id="category"
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    onBlur={() => {
                      if (!formData.category) {
                        showError('category', 'productCategoryError', '카테고리를 선택해주세요.');
                      } else {
                        hideError('category', 'productCategoryError');
                      }
                    }}
                >
                    <option value="">카테고리를 선택하세요</option>
                    {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <div id="productCategoryError" className={styles.errorMessage}></div>
                </div>

                <div>
                <label className={styles.label} htmlFor="itemPrice">가격 (price)</label>
                <input 
                    className={styles.input}
                    type="number" 
                    id="itemPrice"
                    name="price" 
                    placeholder="가격을 입력하세요" 
                    value={formData.price === '' || formData.price === 0 ? '' : formData.price} 
                    onChange={handleChange}
                    onBlur={() => {
                      const priceNum = Number(formData.price);
                      if (!formData.price || priceNum <= 0) {
                        showError('itemPrice', 'productPriceError', '0보다 큰 값을 입력해야 합니다.');
                      } else {
                        hideError('itemPrice', 'productPriceError');
                      }
                    }}
                    min="0" 
                />
                <div id="productPriceError" className={styles.errorMessage}></div>
                </div>

                <div>
                <label className={styles.label} htmlFor="stock">재고 (stock)</label>
                <input 
                    className={styles.input}
                    type="number" 
                    id="stock"
                    name="stock" 
                    placeholder="재고 수량을 입력하세요" 
                    value={formData.stock === '' || formData.stock === 0 ? '' : formData.stock} 
                    onChange={handleChange}
                    onBlur={() => {
                      const stockNum = Number(formData.stock);
                      if (!formData.stock || stockNum <= 0) {
                        showError('stock', 'productStockError', '0보다 큰 값을 입력해야 합니다.');
                      } else {
                        hideError('stock', 'productStockError');
                      }
                    }}
                    min="0" 
                />
                <div id="productStockError" className={styles.errorMessage}></div>
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
                    <Image 
                        src={imagePreview} 
                        alt="미리보기" 
                        style={{ 
                        maxWidth: '200px', 
                        maxHeight: '200px', 
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                        }} 
                        width={200}
                        height={200}
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
                <label className={styles.label} htmlFor="itemTag">태그 (tags)</label>
                <input 
                    className={styles.input}
                    type="text" 
                    id="itemTag"
                    name="tags" 
                    placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 할인, 신상, 겨울옷)" 
                    value={formData.tags} 
                    onChange={handleChange}
                    onBlur={() => {
                      if (!formData.tags.trim()) {
                        showError('itemTag', 'productTagError', '태그를 입력해주세요.');
                      } else {
                        hideError('itemTag', 'productTagError');
                      }
                    }}
                />
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    여러 태그를 입력하려면 쉼표(,)로 구분하세요
                </p>
                <div id="productTagError" className={styles.errorMessage}></div>
                </div>
            </form>
            
            {/* 에러 메시지 표시 */}
            {error && <p className={styles.errorMessage}>{error}</p>}
                </>
            )}
            </div>
        </>
    );
}

export default Registration;