// Helper functions for showing/hiding errors
export function showError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);
    if (input) {
        input.classList.add('error');
        // 인라인 스타일도 추가하여 확실하게 표시
        input.style.border = '2px solid #ef4444';
        input.style.backgroundColor = '#fef2f2';
    }
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        // 인라인 스타일도 추가하여 확실하게 표시
        errorDiv.style.display = 'block';
        errorDiv.style.color = '#ef4444';
    }
}

export function hideError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorDiv = document.getElementById(errorId);
    if (input) {
        input.classList.remove('error');
        // 인라인 스타일 제거
        input.style.border = '';
        input.style.backgroundColor = '';
    }
    if (errorDiv) {
        errorDiv.classList.remove('show');
        errorDiv.textContent = '';
        // 인라인 스타일 제거
        errorDiv.style.display = '';
        errorDiv.style.color = '';
    }
}

// Create Modal dialog show
export function showModal(message) {
    const modal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('modalMessage');
    if (modalMessage) modalMessage.textContent = message;
    if (modal) modal.classList.add('show');
}

// Remove Modal dialog show
export function hideModal() {
    const modal = document.getElementById('errorModal');
    if (modal) modal.classList.remove('show');
}

// Validation function for product registration form
export function validateProductRegisterForm() {
    let isValid = true;
    const productNameVar = document.getElementById('itemName')?.value.trim() || '';
    const productPriceVar = document.getElementById('itemPrice')?.value.trim() || '';
    const productPriceNum = Number(productPriceVar) || 0;
    const productIntroVar = document.getElementById('itemIntro')?.value.trim() || '';
    const productItemTagVar = document.getElementById('itemTag')?.value.trim() || '';
    const productStockVar = document.getElementById('stock')?.value.trim() || '';
    const productStockNum = Number(productStockVar) || 0;
    
    // 상품명 검증
    if (!productNameVar) {
        showError('itemName', 'productNameVarError', '상품명을 입력해주세요.');
        isValid = false;
    } else {
        hideError('itemName', 'productNameVarError');
    }

    // 상품 설명 검증
    if (!productIntroVar) {
        showError('itemIntro', 'productIntroError', '상품 상세 정보를 입력해주세요.');
        isValid = false;
    } else {
        hideError('itemIntro', 'productIntroError');
    }

    // 가격 검증
    if (!productPriceVar || productPriceNum <= 0) {
        showError('itemPrice', 'productPriceError', '0보다 큰 값을 입력해야 합니다.');
        isValid = false;
    } else {
        hideError('itemPrice', 'productPriceError');
    }

    // 재고 검증
    if (!productStockVar || productStockNum <= 0) {
        showError('stock', 'productStockError', '0보다 큰 값을 입력해야 합니다.');
        isValid = false;
    } else {
        hideError('stock', 'productStockError');
    }

    // 태그 검증
    if (!productItemTagVar) {
        showError('itemTag', 'productTagError', '태그를 입력해주세요.');
        isValid = false;
    } else {
        hideError('itemTag', 'productTagError');
    }

    return isValid;
}
