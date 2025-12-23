// Direct URL to Prisma API server
const ListProducts = "/api/products";

// getProduct - 단일 상품 조회
export async function getProduct(id) {
  try {
    const url = `${ListProducts}/${id}`;
    console.log('[getProduct] Fetching URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('상품을 찾을 수 없습니다.');
      }
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const product = await response.json();
    console.log('[getProduct] Product fetched:', product.name);
    console.log('[getProduct] Product tags:', product.tags);
    console.log('[getProduct] Tags type:', typeof product.tags, 'Is Array?', Array.isArray(product.tags));
    if (product.tags && Array.isArray(product.tags)) {
      console.log('[getProduct] Tags length:', product.tags.length);
      if (product.tags.length > 0) {
        console.log('[getProduct] First tag:', product.tags[0]);
      }
    }
    return product;
  } catch (error) {
    console.error("[getProduct] Error fetching product:", error);
    throw error;
  }
}

// getProducts - get Request with api in page, pageSize, orderBy, keyword
export async function getProducts({ page = 1, pageSize = 10, orderBy = "recent", keyword = "" } = {}) {
  try {
    // Construct URL with search params
    const url = new URL(ListProducts, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    if (keyword) {
      url.searchParams.set("keyword", keyword);
    } 
    if (orderBy) {
      url.searchParams.set("orderBy", orderBy);
    }

    console.log('[getProducts] Fetching URL:', url.toString());
    
    let response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // CORS request setting for CORS request
        mode: 'cors',
        credentials: 'omit'
      });
    } catch (fetchError) {
      console.error('[getProducts] Fetch error:', fetchError);
      console.error('[getProducts] Error type:', fetchError.name);
      console.error('[getProducts] Error message:', fetchError.message);
      
      if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
        throw new Error(`Failed to connect to Prisma! Make sure the backend server is running.`);
      }
      throw fetchError;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[getProducts] HTTP error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const dataList = await response.json();
    console.log('[getProducts] API Response:', dataList);
    console.log('[getProducts] Response type:', typeof dataList, 'Is Array?', Array.isArray(dataList));
    

    // 
    if (dataList && typeof dataList === 'object' && Array.isArray(dataList.products)) {
      const items = dataList.products;
      const totalCount = dataList.totalCount || items.length;
      console.log(`[getProducts] Found ${items.length} products, totalCount: ${totalCount}`);

      return {
        products: items,
        totalCount: totalCount
      };
    }

    console.error('[getProducts] Unexpected API response format:', dataList);
    console.error('[getProducts] Response structure:', JSON.stringify(dataList, null, 2));
    return [];

  } catch (error) {
    console.error("[getProducts] Error fetching products:", error);
    console.error("[getProducts] Error details:", error.message, error.stack);
    return [];
  }
}
