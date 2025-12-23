'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link'; // Corrected Link import
import Modal from '../components/modal/modal';
import authorIcon from '../public/assets/icons/ic_profile.svg';
import likeIcon from '../public/assets/icons/heart-icon.svg';
import backToListViewIcon from '../public/assets/icons/ic_back_to_list.svg';
import threeDotsIcon from '../public/assets/icons/ic_kebab.svg';
import defaultArticleImage from '../public/assets/products/default.svg';
import styles from './viewArticle.module.css';
import Image from 'next/image';

// REMOVED: All direct imports from @/app/api/... 
// We will use fetch() instead.

function ViewArticle() {
//   const { articleId } = useParams(); // articleId

const params = useParams();
const articleId = params.articleId || params.id; 

console.log("URL Params:", params); // Debug check
console.log("Using ID:", articleId); // Debug check


  const router = useRouter();
  const navigate = (path) => router.push(path);
  
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment states
  const [commentContent, setCommentContent] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('익명');
  const [submitting, setSubmitting] = useState(false);
  
  // UI states
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [updatingComment, setUpdatingComment] = useState(false);
  const [openCommentDropdownId, setOpenCommentDropdownId] = useState(null);
  
  const actionsDropdownRef = useRef(null);
  const commentDropdownRefs = useRef({});

  // Helper function to sort comments by createdAt (newest first)
  const sortCommentsByDate = (comments) => {
    if (!Array.isArray(comments)) return [];
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  // Fetch comments function (reusable)
  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    try {
      console.log(`Fetching comments: /api/Articles/${articleId}/comments`);
      const res = await fetch(`/api/Articles/${articleId}/comments`);
      
      if (!res.ok) {
        console.error("Failed to fetch comments:", res.status);
        setComments([]);
        return;
      }

      const commentsData = await res.json();
      console.log("Comments loaded:", commentsData);
      
      // Handle both array and object with comments array
      let commentsArray = [];
      if (Array.isArray(commentsData)) {
        commentsArray = commentsData;
      } else if (commentsData.comments && Array.isArray(commentsData.comments)) {
        commentsArray = commentsData.comments;
      }
      
      // Sort comments by createdAt in descending order (newest first)
      const sortedComments = sortCommentsByDate(commentsArray);
      setComments(sortedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  }, [articleId]);

  // 1. Fetch Article Data
  useEffect(() => {
    if (!articleId) return;
  
    const fetchArticle = async () => {
      try {
        setLoading(true);
        console.log(`Fetching: /api/Articles/${articleId}`); // 🔍 Log the URL to check it
        const res = await fetch(`/api/Articles/${articleId}`);
        
        if (!res.ok) {
            if(res.status === 404) throw new Error("게시글을 찾을 수 없습니다.");
            throw new Error("Failed to fetch");
        }
  
        const data = await res.json();
        console.log("Article loaded:", data);
        
        setArticle(data);
        
        // If article includes comments, use them (fallback if comments endpoint doesn't exist)
        if (data.comments && Array.isArray(data.comments)) {
          console.log("Comments found in article data:", data.comments);
          // Sort comments by createdAt in descending order (newest first)
          const sortedComments = sortCommentsByDate(data.comments);
          setComments(sortedComments);
        }
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    fetchComments();
  }, [articleId, fetchComments]);

  // 2. Handle Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setShowActionsDropdown(false);
      }
      
      let clickedOutside = true;
      Object.values(commentDropdownRefs.current).forEach(ref => {
        if (ref && ref.contains(event.target)) {
          clickedOutside = false;
        }
      });
      if (clickedOutside) {
        setOpenCommentDropdownId(null);
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

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return formatDate(dateString);
  };

  // 3. Create Comment (Fixed)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      // FIX: Use fetch instead of importing function
      const res = await fetch(`/api/Articles/${articleId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              articleId: articleId,
              content: commentContent.trim(),
              author: commentAuthor.trim() || '익명'
          })
      });

      if (!res.ok) throw new Error('Failed to create comment');
      
      // Clear the form
      setCommentContent(''); 
      setCommentAuthor('익명');
      
      // Reload comments from backend to ensure consistency
      await fetchComments();
    } catch (err) {
      console.error('[ViewArticle] Error creating comment:', err);
      alert('댓글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Delete Article (Fixed)
  const handleDeleteArticle = async () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    try {
      // FIX: Use fetch DELETE
      const res = await fetch(`/api/Articles/${articleId}`, {
          method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete');

      navigate('/articles');
    } catch (err) {
      console.error('[ViewArticle] Error deleting article:', err);
      setIsDeleting(false);
      alert('게시글 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeletingCommentId(commentId);
    setShowDeleteCommentModal(true);
  };

  // 5. Delete Comment (Fixed)
  const handleConfirmDeleteComment = async () => {
    if (!deletingCommentId) return;

    setShowDeleteCommentModal(false);
    setIsDeletingComment(true);

    try {
      // FIX: Use fetch DELETE for comment
      // Note: Make sure your API route is set up at /api/comments/[id]
      const res = await fetch(`/api/Articles/${articleId}/comments/${deletingCommentId}`, {
          method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete comment');

      setDeletingCommentId(null);
      
      // Reload comments from backend to ensure consistency
      await fetchComments();
    } catch (err) {
      console.error('[ViewArticle] Error deleting comment:', err);
      alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeletingComment(false);
    }
  };

  const handleStartEditComment = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setEditingCommentContent(currentContent);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  // 6. Update Comment (Fixed)
  const handleUpdateComment = async (commentId) => {
    if (!editingCommentContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setUpdatingComment(true);
    try {
      // FIX: Use fetch PATCH/PUT
      const res = await fetch(`/api/Articles/${articleId}/comments/${commentId}`, {
        method: 'PATCH', // or PUT, depending on your API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentContent.trim() })
      });

      if (!res.ok) throw new Error('Failed to update comment');
      
      setEditingCommentId(null);
      setEditingCommentContent('');
      
      // Reload comments from backend to ensure consistency
      await fetchComments();
    } catch (err) {
      console.error('[ViewArticle] Error updating comment:', err);
      alert('댓글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUpdatingComment(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.viewArticleContainer}>
        <div className={styles.viewArticleLoading}>
          <p>게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={styles.viewArticleContainer}>
        <div className={styles.viewArticleError}>
          <p><strong>{error || '게시글을 찾을 수 없습니다.'}</strong></p>
          <button onClick={() => navigate('/articles')} className={styles.backButton}>
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.viewArticleContainer}>
      <div className={styles.viewArticleContent}>
        {/* Article Header */}
        <div className={styles.articleHeader}>
          <div className={styles.articleTitleRow}>
            <h1 className={styles.articleTitle}>{article.title || '제목 없음'}</h1>
            <div className={styles.articleActionsMenu} ref={actionsDropdownRef}>
                  <button 
                    className={styles.articleActionsButton}
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    aria-label="메뉴"
                    disabled={isDeleting}
                  >
                    <Image 
                      src={threeDotsIcon.src || threeDotsIcon} 
                      alt="메뉴" 
                      width={20}
                      height={20}
                    />
                  </button>
              {showActionsDropdown && (
                <div className={styles.articleActionsDropdown}>
                  <Link 
                    href={`/articles/${articleId}/edit`} 
                    className={styles.articleActionItem}
                    onClick={() => setShowActionsDropdown(false)}
                  >
                    수정하기
                  </Link>
                  <button 
                    className={styles.articleActionItem}
                    onClick={() => {
                      setShowActionsDropdown(false);
                      handleDeleteArticle();
                    }}
                  >
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.articleMetaInfo}>
            <div className={styles.articleAuthorInfo}>
              <span className={styles.authorProfileIcon}>
                <Image 
                  src={authorIcon.src || authorIcon} 
                  alt="프로필" 
                  width={20}
                  height={20}
                />
              </span>
              <span className={styles.articleAuthor}>{article.author || '익명'}</span>
              <span className={styles.articleDate}>{formatDate(article.createdAt)}</span>
              <span className={styles.divider}>|</span>
              <div className={styles.articleLikesContainer}>
                <Image 
                  src={likeIcon.src || likeIcon} 
                  alt="좋아요" 
                  className={styles.likeIcon} 
                  width={20}
                  height={20}
                />
                <span className={styles.articleLikesCount}>{article.favoriteCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className={styles.articleBody}>
          <div className={styles.articleImageContainer}>
            <Image 
              src={article.image || defaultArticleImage} 
              alt={article.title || '게시글 이미지'} 
              className={styles.articleMainImage} 
              width={500}
              height={500}
              loading="eager"
            />
          </div>
          <div className={styles.articleTextContent}>
            {article.content || '내용이 없습니다.'}
          </div>
        </div>

        {/* Comment Input Section */}
        <div className={styles.commentInputSection}>
          <h2 className={styles.commentSectionTitle}>댓글달기</h2>
          <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
            <textarea
              className={styles.commentTextarea}
              placeholder="댓글을 입력해주세요."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              rows={4}
            />
            <button 
              type="submit" 
              className={styles.commentSubmitButton}
              disabled={submitting || !commentContent.trim() || isDeleting || editingCommentId !== null || isDeletingComment}
            >
              등록
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className={styles.commentsSection}>
          {comments.length === 0 ? (
            <p className={styles.noComments}>댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <div className={styles.commentContentRow}>
                  {editingCommentId === comment.id ? (
                    <textarea
                      className={styles.commentEditTextarea}
                      value={editingCommentContent}
                      onChange={(e) => setEditingCommentContent(e.target.value)}
                      rows={3}
                      disabled={updatingComment}
                    />
                  ) : (
                    <p className={styles.commentContent}>{comment.content}</p>
                  )}
                  {editingCommentId !== comment.id && (
                    <div 
                      className={styles.commentActionsMenu} 
                      ref={(el) => commentDropdownRefs.current[comment.id] = el}
                    >
                      <button 
                        className={styles.commentActionsButton}
                        onClick={() => setOpenCommentDropdownId(
                          openCommentDropdownId === comment.id ? null : comment.id
                        )}
                        disabled={isDeleting || editingCommentId !== null || isDeletingComment}
                        aria-label="메뉴"
                      >
                        <Image 
                          src={threeDotsIcon.src || threeDotsIcon} alt="메뉴" 
                          width={20}
                          height={20}
                        />
                      </button>
                      {openCommentDropdownId === comment.id && (
                        <div className={styles.commentActionsDropdown}>
                          <button 
                            className={styles.commentActionItem}
                            onClick={() => {
                              setOpenCommentDropdownId(null);
                              handleStartEditComment(comment.id, comment.content);
                            }}
                          >
                            수정하기
                          </button>
                          <button 
                            className={styles.commentActionItem}
                            onClick={() => {
                              setOpenCommentDropdownId(null);
                              handleDeleteComment(comment.id);
                            }}
                          >
                            삭제하기
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthorIcon}>
                    <Image 
                      src={authorIcon.src || authorIcon} alt="프로필" 
                      width={20}
                      height={20}
                    />
                  </span>
                  <span className={styles.commentAuthor}>{comment.author || '익명'}</span>
                  <span className={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</span>
                  {editingCommentId === comment.id && (
                    <div className={styles.commentMetaButtons}>
                      <button 
                        className={styles.commentUpdateBtn}
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={updatingComment || !editingCommentContent.trim()}
                      >
                        수정완료
                      </button>
                      <button 
                        className={styles.commentCancelBtn}
                        onClick={handleCancelEditComment}
                        disabled={updatingComment}
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back Button */}
        <button onClick={() => navigate('/articles')} className={styles.backToListButton} disabled={isDeleting}>
          목록으로 돌아가기
          <Image 
            src={backToListViewIcon.src || backToListViewIcon} 
            alt="목록으로 돌아가기" 
            className={styles.backToListButtonIcon} 
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)} showCloseButton={false}>
          <div className={styles.deleteModalContent}>
            <h3 className={styles.deleteModalTitle}>게시글 삭제</h3>
            <p className={styles.deleteModalMessage}>
              정말 이 게시글을 삭제하시겠습니까?<br />
              댓글도 함께 삭제됩니다.
            </p>
            <div className={styles.deleteModalButtons}>
              <button 
                className={styles.deleteModalCancel}
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button 
                className={styles.deleteModalConfirm}
                onClick={handleConfirmDelete}
              >
                확인
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Comment Confirmation Modal */}
      {showDeleteCommentModal && (
        <Modal onClose={() => setShowDeleteCommentModal(false)} showCloseButton={false}>
          <div className={styles.deleteModalContent}>
            <h3 className={styles.deleteModalTitle}>댓글 삭제</h3>
            <p className={styles.deleteModalMessage}>
              정말 이 댓글을 삭제하시겠습니까?
            </p>
            <div className={styles.deleteModalButtons}>
              <button 
                className={styles.deleteModalCancel}
                onClick={() => {
                  setShowDeleteCommentModal(false);
                  setDeletingCommentId(null);
                }}
              >
                취소
              </button>
              <button 
                className={styles.deleteModalConfirm}
                onClick={handleConfirmDeleteComment}
              >
                확인
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deleting Overlay */}
      {(isDeleting || isDeletingComment) && (
        <div className={styles.deletingOverlay}>
          <div className={styles.deletingMessage}>
            <p>삭제중...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewArticle;