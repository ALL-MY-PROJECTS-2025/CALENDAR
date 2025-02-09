import React from 'react';
import { IoClose } from 'react-icons/io5';
import './css/UserModal.css';

const UserModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">사용자 설정</h2>
          <button className="close-button" onClick={onClose}>
            <IoClose />
          </button>
        </div>
        <div className="modal-content">
          {/* 여기에 사용자 관련 컨텐츠가 들어갈 예정입니다 */}

          {/* 사용자 패스워드 변경 */}

          {/* 구글 캘린더 설정 */}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
