import React from 'react';
import './modal.module.css';

function Modal({ children, onClose, showCloseButton = true }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
                {showCloseButton && (
                    <button className="modal-close-button" onClick={onClose}>
                        <img src="/src/assets/icons/ic_close.svg" alt="닫기" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default Modal;

