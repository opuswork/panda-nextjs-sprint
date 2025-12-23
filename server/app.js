import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
// CORS 설정 - React 앱(localhost:5173, 5174)과 통신하기 위해
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // CORS 허용
app.use(express.json({ limit: '50mb' })); // JSON 파싱 (이미지 업로드를 위해 크기 제한 증가)
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // URL 인코딩된 데이터 파싱

// OPTIONS 요청 처리 (preflight)
app.options('*', cors(corsOptions));

// GET /products - 상품 목록 조회
app.get('/products', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, orderBy = 'id', keyword = '' } = req.query;
    
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const skip = (pageNum - 1) * pageSizeNum;

    // 검색 조건 구성
    // PostgreSQL의 경우 mode: 'insensitive'를 사용하려면 Prisma가 지원해야 함
    const where = keyword ? {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } }
      ]
    } : {};

    console.log('[Backend] Query params:', { page: pageNum, pageSize: pageSizeNum, orderBy, keyword });
    console.log('[Backend] Where clause:', JSON.stringify(where, null, 2));

    // 정렬 조건 구성
    let orderByClause = {};
    switch (orderBy) {
      case 'recent':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderByClause = { createdAt: 'asc' };
        break;
      case 'price_asc':
        orderByClause = { price: 'asc' };
        break;
      case 'price_desc':
        orderByClause = { price: 'desc' };
        break;
      case 'favorite':
        orderByClause = { favoriteCount: 'desc' };
        break;
      default:
        orderByClause = { favoriteCount: 'desc' };
    }

    // 전체 개수 조회
    const totalCount = await prisma.product.count({ where });
    console.log('[Backend] Total count:', totalCount);

    // 상품 목록 조회 (태그 정보 포함)
    const products = await prisma.product.findMany({
      where,
      skip,
      take: pageSizeNum,
      orderBy: orderByClause,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
    });

    console.log('[Backend] Found products:', products.length);
    
    if (products.length > 0) {
      console.log('[Backend] First product sample:', JSON.stringify({
        id: products[0].id,
        name: products[0].name,
        category: products[0].category,
        hasImage: !!products[0].image,
        tagsCount: products[0].tags?.length || 0
      }, null, 2));
    }

    // React 컴포넌트가 기대하는 형식으로 데이터 변환
    const transformedProducts = products.map(product => {
      try {
        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          category: product.category,
          price: product.price,
          stock: product.stock,
          productImage: product.image,
          images: product.image || '/src/assets/products/default.png',
          favoriteCount: product.favoriteCount || 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          // 태그 정보 (선택사항) - 태그가 없을 수 있으므로 안전하게 처리
          tags: (product.tags && Array.isArray(product.tags)) 
            ? product.tags.map(pt => ({
                id: pt.tag?.id,
                name: pt.tag?.name
              })).filter(tag => tag.id && tag.name) // null 제거
            : []
        };
      } catch (error) {
        console.error('[Backend] Error transforming product:', product.id, error);
        // 에러가 발생해도 기본 정보는 반환
        return {
          id: product.id,
          name: product.name || 'Unknown',
          description: product.description || '',
          category: product.category || 'FASHION',
          price: product.price || 0,
          stock: product.stock || 0,
          productImage: product.image,
          images: product.image || '/src/assets/products/default.png',
          favoriteCount: product.favoriteCount || 0,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          tags: []
        };
      }
    });

    const response = {
      products: transformedProducts,
      totalCount,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(totalCount / pageSizeNum)
    };
    
    console.log('[Backend] Sending response:', {
      productsCount: transformedProducts.length,
      totalCount,
      totalPages: response.totalPages
    });
    
    res.json(response);
  } catch (error) {
    console.error('상품 목록 조회 실패:', error);
    res.status(500).json({ 
      message: '상품 목록을 불러오는데 실패했습니다.',
      error: error.message 
    });
  }
});

// GET /products/:id - 특정 상품 조회
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[Backend] Fetching product by ID:', id);

    // 상품 조회 (태그 정보 포함)
    const product = await prisma.product.findUnique({
      where: {
        id: id
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
    });

    if (!product) {
      console.log('[Backend] Product not found:', id);
      return res.status(404).json({ 
        message: '상품을 찾을 수 없습니다.',
        id: id
      });
    }

    console.log('[Backend] Found product:', product.name);

    // transform data to match React component expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stock: product.stock,
      productImage: product.image,
      images: product.image || '/src/assets/products/default.png',
      favoriteCount: product.favoriteCount || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      tags: (product.tags && Array.isArray(product.tags)) 
        ? product.tags.map(pt => ({
            id: pt.tag?.id,
            name: pt.tag?.name
          })).filter(tag => tag.id && tag.name)
        : []
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error('상품 조회 실패:', error);
    res.status(500).json({ 
      message: '상품을 불러오는데 실패했습니다.',
      error: error.message 
    });
  }
});

// POST /products - create product
app.post('/products', async (req, res) => {
  try {
    const { name, description, category, price, stock, productImage, image, tags } = req.body;
    // both productImage and image are supported (compatibility)
    const productImageUrl = productImage || image || null;

    // validate required fields
    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({ 
        message: '필수 필드가 누락되었습니다. (name, category, price, stock)' 
      });
    }

    // validate category enum
    const validCategories = ['FASHION', 'BEAUTY', 'SPORTS', 'ELECTRONICS', 'HOME_INTERIOR', 'HOUSEHOLD_SUPPLIES', 'KITCHENWARE'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        message: `유효하지 않은 카테고리입니다. 가능한 값: ${validCategories.join(', ')}` 
      });
    }

    // tag processing: receive tag name array and find or create Tag and connect
    console.log('[Backend] Received tags:', tags);
    const tagNames = Array.isArray(tags) ? tags : (tags ? [tags] : []);
    console.log('[Backend] Processed tag names:', tagNames);
    const tagConnections = [];

    if (tagNames.length > 0) {
      for (const tagName of tagNames) {
        if (tagName && tagName.trim()) {
          try {
            // check if tag exists, if not create it
            const tag = await prisma.tag.upsert({
              where: { name: tagName.trim() },
              update: {},
              create: { name: tagName.trim() },
            });
            console.log('[Backend] Tag processed:', tag.name, tag.id);
            tagConnections.push({ tagId: tag.id });
          } catch (tagError) {
            console.error('[Backend] Error processing tag:', tagName, tagError);
            // even if tag processing fails, product creation continues
          }
        }
      }
    }
    console.log('[Backend] Tag connections:', tagConnections.length);

    // create product (include tag connections)
    console.log('[Backend] Creating product with tag connections:', tagConnections.length);
    
    const product = await prisma.product.create({
      data: {
        name,
        description: description || '',
        category: category, // automatically converted to enum
        price: parseFloat(price),
        stock: parseInt(stock),
        image: productImageUrl, // use image field from schema
        tags: tagConnections.length > 0 ? {
          create: tagConnections, // create tag connections
        } : undefined, // if no tags, set to undefined
      },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
    });

    console.log('[Backend] Product created. Tags from DB:', product.tags?.length || 0);
    if (product.tags && product.tags.length > 0) {
      console.log('[Backend] Product tags:', product.tags.map(pt => ({
        productTagId: pt.productId,
        tagId: pt.tag?.id,
        tagName: pt.tag?.name
      })));
    }

    // transform data to match React component expectations
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      productImage: product.image,
      images: product.image || '/src/assets/products/default.png',
      favoriteCount: product.favoriteCount || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      tags: (product.tags && Array.isArray(product.tags) && product.tags.length > 0)
        ? product.tags.map(pt => {
            const tagData = {
              id: pt.tag?.id,
              name: pt.tag?.name
            };
            console.log('[Backend] Mapping tag:', tagData);
            return tagData;
          }).filter(tag => tag.id && tag.name)
        : []
    };
    
    console.log('[Backend] Product created with tags:', transformedProduct.tags.length, 'tags');
    console.log('[Backend] Final tags array:', transformedProduct.tags);

    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error('상품 생성 실패:', error);
    res.status(500).json({ 
      message: '상품 등록에 실패했습니다.',
      error: error.message 
    });
  }
});

// PATCH /products/:id - update product information
app.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, image, productImage, tags } = req.body;
    
    console.log('[Backend] Updating product:', id);
    console.log('[Backend] Received tags:', tags);

    // check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ 
        message: '상품을 찾을 수 없습니다.',
        id: id
      });
    }

    // configure data to update
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (image !== undefined || productImage !== undefined) {
      updateData.image = image || productImage || null;
    }

    // tag processing: if tags are provided, delete existing tags and replace with new tags
    if (tags !== undefined && Array.isArray(tags)) {
      console.log('[Backend] Processing tags array:', tags);
      console.log('[Backend] Tags array length:', tags.length);
      
      // delete existing tag connections
      await prisma.productTag.deleteMany({
        where: { productId: id }
      });
      console.log('[Backend] Deleted existing tag connections');

      // create new tag connections
      const tagNames = tags.filter(tag => {
        const isValid = tag && (typeof tag === 'string' ? tag.trim() : String(tag).trim());
        if (!isValid) {
          console.log('[Backend] Filtered out invalid tag:', tag, typeof tag);
        }
        return isValid;
      });
      
      console.log('[Backend] Filtered tag names:', tagNames);
      console.log('[Backend] Filtered tag names length:', tagNames.length);
      
      const tagConnections = [];

      if (tagNames.length > 0) {
        for (const tagName of tagNames) {
          const tagNameStr = typeof tagName === 'string' ? tagName.trim() : String(tagName).trim();
          console.log('[Backend] Processing tag:', tagNameStr);
          
          if (tagNameStr) {
            try {
              const tag = await prisma.tag.upsert({
                where: { name: tagNameStr },
                update: {},
                create: { name: tagNameStr },
              });
              console.log('[Backend] Tag processed successfully:', tag.name, tag.id);
              tagConnections.push({ tagId: tag.id });
            } catch (tagError) {
              console.error('[Backend] Error processing tag:', tagNameStr, tagError);
              console.error('[Backend] Error details:', tagError.message, tagError.stack);
            }
          } else {
            console.log('[Backend] Skipping empty tag:', tagName);
          }
        }
      }

      console.log('[Backend] Tag connections created:', tagConnections.length);
      console.log('[Backend] Tag connections:', tagConnections);

      // add tag connections to updateData
      if (tagConnections.length > 0) {
        updateData.tags = {
          create: tagConnections
        };
        console.log('[Backend] Added tags to updateData:', tagConnections.length, 'tags');
      } else {
        console.log('[Backend] No tag connections to add');
      }
    } else {
      console.log('[Backend] Tags not provided or not an array:', tags);
    }

    // update product
    console.log('[Backend] Updating product with data:', JSON.stringify(updateData, null, 2));
    const product = await prisma.product.update({
      where: { id: id },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      },
    });

    console.log('[Backend] Product updated. Tags from DB:', product.tags?.length || 0);
    if (product.tags && product.tags.length > 0) {
      console.log('[Backend] Product tags from DB:', product.tags.map(pt => ({
        productTagId: pt.productId,
        tagId: pt.tag?.id,
        tagName: pt.tag?.name
      })));
    }

    // transform data to match React component expectations
    const transformedTags = (product.tags && Array.isArray(product.tags)) 
      ? product.tags.map(pt => {
          const tagData = {
            id: pt.tag?.id,
            name: pt.tag?.name
          };
          console.log('[Backend] Mapping tag:', tagData);
          return tagData;
        }).filter(tag => {
          const isValid = tag.id && tag.name;
          if (!isValid) {
            console.log('[Backend] Filtered out invalid tag:', tag);
          }
          return isValid;
        })
      : [];
    
    console.log('[Backend] Transformed tags:', transformedTags);
    console.log('[Backend] Transformed tags length:', transformedTags.length);

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stock: product.stock,
      productImage: product.image,
      images: product.image || '/src/assets/products/default.png',
      favoriteCount: product.favoriteCount || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      tags: transformedTags
    };

    console.log('[Backend] Product updated:', product.name);
    res.json(transformedProduct);
  } catch (error) {
    console.error('상품 수정 실패:', error);
    res.status(500).json({ 
      message: '상품 수정에 실패했습니다.',
      error: error.message 
    });
  }
});

// DELETE /products/:id - delete product
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('[Backend] Deleting product:', id);

    // check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
      include: {
        tags: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({ 
        message: '상품을 찾을 수 없습니다.',
        id: id
      });
    }

    console.log('[Backend] Product has', existingProduct.tags?.length || 0, 'tag connections');

    // 1. delete ProductTag connections first (needed due to foreign key constraints)
    await prisma.productTag.deleteMany({
      where: { productId: id }
    });
    console.log('[Backend] Deleted ProductTag connections');

    // 2. then delete product
    await prisma.product.delete({
      where: { id: id }
    });

    console.log('[Backend] Product deleted:', existingProduct.name);
    res.status(200).json({ 
      message: '상품이 삭제되었습니다.',
      id: id
    });
  } catch (error) {
    console.error('[Backend] 상품 삭제 실패:', error);
    console.error('[Backend] Error details:', error.message);
    console.error('[Backend] Error stack:', error.stack);
    res.status(500).json({ 
      message: '상품 삭제에 실패했습니다.',
      error: error.message 
    });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// POST /articles - 게시글 생성

app.post('/articles', async (req, res) => {
  try {
    const { title, content, image, author } = req.body;
    
    // 필수 필드 검증
    if (!title || !content) {
      return res.status(400).json({ 
        message: '제목과 내용은 필수입니다.',
        error: 'Missing required fields: title, content'
      });
    }

    console.log('[Backend] Creating article:', {
      title,
      content: content.substring(0, 50) + '...',
      author: author || '익명',
      hasImage: !!image
    });

    const article = await prisma.article.create({
      data: { 
        title, 
        content, 
        image: image || null, // base64 문자열 또는 null
        author: author || null
      },
    });
    
    console.log('[Backend] Article created successfully:', article.id);
    res.status(201).json(article);
  } catch (error) {
    console.error('[Backend] Article creation failed:', error);
    res.status(500).json({ 
      message: '게시글 등록에 실패했습니다.', 
      error: error.message 
    });
  }
});

// PATCH /articles/:id - 게시글 수정
app.patch('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image, author } = req.body;

    const article = await prisma.article.update({
      where: { id: id },
      data: { title, content, image, author },
      include: {
        comments: {
          orderBy: { createdAt: 'asc' }
        }
      }
    }); 

    console.log('[Backend] Article updated:', article.title);
    console.log('[Backend] Article updated:', article.content);
    console.log('[Backend] Article updated:', article.image);
    console.log('[Backend] Article updated:', article.author);
    const transformedArticle = {
      id: article.id,
      title: article.title,
      content: article.content,
      image: article.image,
      author: article.author,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
      comments: article.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }))
    };

    console.log('[Backend] Transformed article:', transformedArticle);

    res.status(200).json(transformedArticle);
  } catch (error) {
    console.error('[Backend] Article update failed:', error);
    res.status(500).json({ message: 'Article update failed', error: error.message });
  }
});

// DELETE /articles/:id - 게시글 삭제
app.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Backend] Deleting article:', id);
    const article = await prisma.article.delete({
      where: { id: id }
    });
    console.log('[Backend] Article deleted:', article.id);
    res.status(200).json(article);
  } catch (error) {
    console.error('[Backend] Article deletion failed:', error);
    res.status(500).json({ message: 'Article deletion failed', error: error.message });
  }
});




// PATCH /articles/:id/comments/:commentId - 댓글 수정
app.patch('/articles/:articleId/comments/:commentId', async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { content, author } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }
    
    const comment = await prisma.comment.update({
      where: { 
        id: commentId,
        articleId: articleId
      },
      data: {
        content: content.trim(),
        author: author || undefined
      }
    });
    
    console.log('[Backend] Comment updated:', commentId);
    res.status(200).json(comment);
  } catch (error) {
    console.error('[Backend] Comment update failed:', error);
    res.status(500).json({ message: '댓글 수정에 실패했습니다.', error: error.message });
  }
});

// DELETE /articles/:id/comments/:commentId - 특정 게시글의 특정 댓글 삭제
app.delete('/articles/:articleId/comments/:commentId', async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    console.log('[Backend] Deleting comment:', articleId, commentId);
    const comment = await prisma.comment.delete({
      where: { articleId: articleId, id: commentId }
    });
    console.log('[Backend] Comment deleted:', articleId, commentId);
    res.status(200).json(comment);
  } catch (error) {
    console.error('[Backend] Comment deletion failed:', error);
    res.status(500).json({ message: 'Comment deletion failed', error: error.message });
  }
});

// GET /articles - 게시글 목록 조회
app.get('/articles', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, orderBy = 'recent', keyword = '' } = req.query;
    
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const skip = (pageNum - 1) * pageSizeNum;

    // 검색 조건 구성
    const where = keyword ? {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } }
      ]
    } : {};

    console.log('[Backend] Articles query params:', { page: pageNum, pageSize: pageSizeNum, orderBy, keyword });
    console.log('[Backend] Articles where clause:', JSON.stringify(where, null, 2));

    // 정렬 조건 구성
    let orderByClause = {};
    switch (orderBy) {
      case 'recent':
        orderByClause = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderByClause = { createdAt: 'asc' };
        break;
      default:
        orderByClause = { createdAt: 'desc' };
    }

    // 전체 개수 조회
    const totalCount = await prisma.article.count({ where });
    console.log('[Backend] Articles total count:', totalCount);

    // 게시글 목록 조회
    const articles = await prisma.article.findMany({
      where,
      skip,
      take: pageSizeNum,
      orderBy: orderByClause,
    });

    console.log('[Backend] Found articles:', articles.length);

    const response = {
      articles: articles,
      totalCount,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(totalCount / pageSizeNum)
    };
    
    console.log('[Backend] Sending articles response:', {
      articlesCount: articles.length,
      totalCount,
      totalPages: response.totalPages
    });
    
    res.json(response);
  } catch (error) {
    console.error('Article retrieval failed:', error);
    res.status(500).json({ message: 'Article retrieval failed', error: error.message });
  }
});

// GET /articles/:id - 게시글 상세 조회
app.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ 
      where: { id: id },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Article retrieval failed:', error);
    res.status(500).json({ message: 'Article retrieval failed', error: error.message });
  }
});

// GET /articles/:id/comments - 게시글의 댓글 목록 조회
app.get('/articles/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;
    const comments = await prisma.comment.findMany({ where: { articleId: articleId } });
    res.json(comments);
  } catch (error) {
    console.error('Comments retrieval failed:', error);
    res.status(500).json({ message: 'Comments retrieval failed', error: error.message });
  }
});

// GET /articles/:id/comments/:commentId - 게시글의 특정 댓글 조회
app.get('/articles/:articleId/comments/:commentId', async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id: commentId, articleId: articleId } });
    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    res.json(comment);
  } catch (error) {
    console.error('Comment retrieval failed:', error);
    res.status(500).json({ message: 'Comment retrieval failed', error: error.message });
  }
});




// get all comments by comments.http
app.get('/comments', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany();
    res.json(comments);
  } catch (error) {
    console.error('Comments retrieval failed:', error);
    res.status(500).json({ message: 'Comments retrieval failed', error: error.message });
  }
});



// get comment by id by comments.http
app.get('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({ where: { id: id } });
    res.json(comment);
  } catch (error) {
    console.error('Comment retrieval failed:', error);
    res.status(500).json({ message: 'Comment retrieval failed', error: error.message });
  }
});

// patch comment by id by comments.http
app.patch('/comments/:id', async (req, res) => {

  try {
    const { id } = req.params;
    const { content, author } = req.body;
    const comment = await prisma.comment.update({ where: { id: id }, data: { content: content.trim(), author: author || '익명' } });
    res.json(comment);
  } catch (error) {
    console.error('Comment update failed:', error);
    res.status(500).json({ message: 'Comment update failed', error: error.message });
  }
});

// delete comment by id by comments.http
app.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.delete({ where: { id: id } });
    res.json(comment);
  } catch (error) {
    console.error('Comment deletion failed:', error);
    res.status(500).json({ message: 'Comment deletion failed', error: error.message });
  }
});



// POST /articles/:id/comments - 댓글 생성
app.post('/articles/:articleId/comments', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content, author } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
    }
    
    // 게시글이 존재하는지 확인
    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        author: author || '익명',
        articleId: articleId
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Comment creation failed:', error);
    res.status(500).json({ message: '댓글 등록에 실패했습니다.', error: error.message });
  }
});


// POST /users
app.post('/users', async (req, res) => {
  try {
    // ✅ 1. Add 'address' to the destructured variables
    const { email, firstName, lastName, nickname, password } = req.body;
    
    // Validate required fields (If address is mandatory in DB, check it here too)
    if (!email || !firstName || !lastName || !nickname || !password) {
      return res.status(400).json({ 
        message: '모든 필드(주소 포함)를 입력해주세요.',
        error: 'Missing required fields'
      });
    }

    console.log('[Backend] Creating user:', { email, firstName, lastName, nickname });

    const newUser = await prisma.user.create({
      data: { 
        email, 
        firstName, 
        lastName,
        nickname,
        password
      },
    });
    
    console.log('[Backend] User created successfully:', newUser.id);
    res.status(201).json(newUser);

  } catch (error) {
    console.error('[Backend] User creation failed:', error);
    if (error.code === 'P2002') {
        return res.status(409).json({ message: '이미 존재하는 이메일 또는 닉네임입니다.' });
    }
    res.status(500).json({ message: '회원 등록 실패', error: error.message });
  }
});

app.post('/users/login', async (req, res) => {
  // User login logic here
  res.status(501).json({ message: 'User login not implemented yet.' });
});


// user patch and delete endpoints can be added similarly 
// PATCH /users/:id - 유저 정보 수정
app.patch('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, nickname, password } = req.body;

    const user = await prisma.user.update({
      where: { id: id },
      data: { email, firstName, lastName, nickname, password }
    });

    console.log('[Backend] User updated:', user);
    res.status(200).json(user);
  } catch (error) {
    console.error('[Backend] User update failed:', error);
    res.status(500).json({ message: 'User update failed', error: error.message });
  }
});

// DELETE /users/:id - 유저 삭제
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[Backend] Deleting user:', id);
    const user = await prisma.user.delete({
      where: { id: id }
    });
    console.log('[Backend] User deleted:', user.id);
    res.status(200).json(user);
  } catch (error) {
    console.error('[Backend] User deletion failed:', error);
    res.status(500).json({ message: 'User deletion failed', error: error.message });
  }
});


// get users list
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('User retrieval failed:', error);
    res.status(500).json({ message: 'User retrieval failed', error: error.message });
  }
});

// get user by id
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('User retrieval failed:', error);
    res.status(500).json({ message: 'User retrieval failed', error: error.message });
  }
});


// POST /auth/login - Log in an existing user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
    }

    console.log('[Backend] Login attempt for:', email);

    // 2. Find the user in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 3. Check if user exists
    if (!user) {
      return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
    }

    // 4. Validate Password
    // ⚠️ IMPORTANT: In a real app, you should use bcrypt.compare() here.
    // But since your registration saved plain text, we compare plain text.
    if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    // 5. Login Success!
    // (Optional: You can generate a JWT token here in the future)
    console.log('[Backend] Login successful for user:', user.id);
    
    // Return user info (excluding the password for security)
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ 
      message: '로그인 성공!',
      user: userWithoutPassword 
    });

  } catch (error) {
    console.error('[Backend] Login error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});