"use client";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'next/navigation';
import { getProduct } from '@/app/api/products';
import styles from './ProductDetail.module.css';
import defaultProductImage from '../public/assets/products/default.svg';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Helper function to normalize image path from API
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return '/assets/products/default.svg';
    // Replace /src/assets with /assets for Next.js public folder
    if (imagePath.startsWith('/src/assets')) {
        return imagePath.replace('/src/assets', '/assets');
    }
    // If it's already a valid path, use it
    if (imagePath.startsWith('/assets') || imagePath.startsWith('http')) {
        return imagePath;
    }
    // Default fallback - use string path for Next.js Image
    return '/assets/products/default.svg';
};

function ProductDetail() {
    const { id } = useParams();
    const router = useRouter(); // Next.js 라우터 사용
    const navigate = (path) => router.push(path);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
          try {
            setLoading(true);
            setError(null);
            console.log('[ProductDetail] Fetching product:', id);
            const data = await getProduct(id);
            setProduct(data);
          } catch (err) {
            console.error('[ProductDetail] Error:', err);
            setError(err.message || '상품을 불러오는데 실패했습니다.');
          } finally {
            setLoading(false);
          }
        };
    
        if (id) {
          fetchProduct();
        }
      }, [id]);
    
      if (loading) {
        return (
          <div className={styles.productDetailContainer}>
            <div className={styles.productDetailLoading}>
              <p>상품 정보를 불러오는 중...</p>
            </div>
          </div>
        );
      }
    
      if (error) {
        return (
          <div className={styles.productDetailContainer}>
            <div className={styles.productDetailError}>
              <p><strong>{error}</strong></p>
              <button onClick={() => navigate('/products')} className={styles.backButton}>
                목록으로 돌아가기
              </button>
            </div>
          </div>
        );
      }
    
      if (!product) {
        return (
          <div className={styles.productDetailContainer}>
            <div className={styles.productDetailError}>
              <p>상품을 찾을 수 없습니다.</p>
              <button onClick={() => navigate('/products')} className={styles.backButton}>
                목록으로 돌아가기
              </button>
            </div>
          </div>
        );
      }
    
      const categoryLabels = {
        FASHION: '패션',
        BEAUTY: '뷰티',
        SPORTS: '스포츠',
        ELECTRONICS: '전자제품',
        HOME_INTERIOR: '홈인테리어',
        HOUSEHOLD_SUPPLIES: '생활용품',
        KITCHENWARE: '주방용품',
      };

  return (
    <>
        <div className={styles.productDetailContainer}>
            <div className={styles.productDetailHeader}>
                <button onClick={() => navigate('/products')} className={styles.backButton}>
                ← 목록으로
                </button>
            </div>
            
            <div className={styles.productDetailContent}>
                <div className={styles.productDetailImageSection}>
                <Image 
                    src={normalizeImagePath(product.images)} 
                    alt={product.name}
                    className={styles.productDetailImage}
                    style={{ height: 'auto' }}
                    onError={(e) => {
                        console.error('[ProductDetail] Image load error:', product.images);
                        // Fallback to default image
                        const imgSrc = typeof defaultProductImage === 'string' 
                            ? defaultProductImage 
                            : defaultProductImage.src || '/assets/products/default.svg';
                        e.target.src = imgSrc;
                    }}
                    width={200}
                    height={200}
                />
                </div>
                
                <div className={styles.productDetailInfoSection}>
                    <div className={styles.productDetailTitleSection}>
                        <h1 className={styles.productDetailName}>{product.name}</h1>
                        <button 
                        onClick={() => navigate(`/products/${product.id}/edit`)} 
                        className={styles.editButton}
                        >
                        수정
                        </button>
                    </div>
                    
                    <div className={styles.productDetailCategory}>
                        {categoryLabels[product.category] || product.category}
                    </div>
                    
                    {product.description && (
                        <div className={styles.productDetailDescription}>
                        <h3>상품 설명</h3>
                        <p>{product.description}</p>
                        </div>
                    )}
                    
                    <div className={styles.productDetailPriceSection}>
                        <div className={styles.productDetailPrice}>
                        {product.price ? product.price.toLocaleString() : 0}원
                        </div>
                        <div className={styles.productDetailFavorite}>
                        ♡ {product.favoriteCount || 0}
                        </div>
                    </div>
                    
                    <div className={styles.productDetailStock}>
                        <strong>재고:</strong> {product.stock || 0}개
                    </div>
                    
                    {product.tags && product.tags.length > 0 && (
                        <div className={styles.productDetailTags}>
                        <h3>태그</h3>
                        <div className={styles.tagsList}>
                            {product.tags.map((tag) => (
                            <span key={tag.id || tag} className={styles.tagItem}>
                                {typeof tag === 'object' ? tag.name : tag}
                            </span>
                            ))}
                        </div>
                        </div>
                    )}
                    
                    <div className={styles.productDetailMeta}>
                        <div className={styles.productDetailDate}>
                        <strong>등록일:</strong> {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                        {product.updatedAt && product.updatedAt !== product.createdAt && (
                        <div className={styles.productDetailDate}>
                            <strong>수정일:</strong> {new Date(product.updatedAt).toLocaleDateString('ko-KR')}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
  );
}

export default ProductDetail;