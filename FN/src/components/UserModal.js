import React, { useState } from 'react';
import axios from 'axios';
import { IoClose } from 'react-icons/io5';
import './css/UserModal.css';

function UserModal({ isOpen, onClose, userInfo }) {
  // 수정할 정보를 위한 state
  const [editedInfo, setEditedInfo] = useState({
    username: '',
    calendarApi: '',
    calendarId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 비밀번호 확인 상태 추가
  const [passwordVerified, setPasswordVerified] = useState(false);

  // 유효성 검사 에러 메시지를 위한 state
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 모달이 열릴 때마다 현재 userInfo로 editedInfo 초기화
  React.useEffect(() => {
    if (userInfo) {
      setEditedInfo(prev => ({
        ...prev,
        username: userInfo.username || '',
        calendarApi: userInfo.calendarApi || '',
        calendarId: userInfo.calendarId || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setIsEditing(true);
      // 에러 메시지 초기화
      setErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [userInfo]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
    // 입력 시 해당 필드의 에러 메시지 초기화
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  // handleVerifyPassword 함수 수정
  const handleVerifyPassword = async () => {
    if (!editedInfo.currentPassword.trim()) {
      setErrors(prev => ({
        ...prev,
        currentPassword: '현재 비밀번호를 입력해주세요.'
      }));
      return;
    }

    try {
      const response = await axios.post('/bn/user/password/check',
        { currentPassword: editedInfo.currentPassword },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setPasswordVerified(true);
        setErrors(prev => ({
          ...prev,
          currentPassword: ''
        }));
      }
    } catch (error) {
      console.error('비밀번호 확인 중 오류 발생:', error);
      setErrors(prev => ({
        ...prev,
        currentPassword: '비밀번호가 일치하지 않습니다.'
      }));
      setPasswordVerified(false);
    }
  };

  // 유효성 검사 함수
  const validateForm = async () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    // 새 비밀번호가 입력된 경우에만 검증
    if (editedInfo.newPassword || editedInfo.confirmPassword) {
      if (!passwordVerified) {
        newErrors.currentPassword = '현재 비밀번호 확인이 필요합니다.';
        isValid = false;
      }

      if (editedInfo.newPassword.length < 8) {
        newErrors.newPassword = '새 비밀번호는 8자 이상이어야 합니다.';
        isValid = false;
      }

      if (editedInfo.newPassword !== editedInfo.confirmPassword) {
        newErrors.confirmPassword = '새 비밀번호가 일치하지 않습니다.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // 패스워드 확인 입력 시 엔터키 핸들러 추가
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 폼 제출 방지
      handleVerifyPassword();
    }
  };

  // 폼 제출 핸들러 수정
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 제출 동작 방지
    if (e.nativeEvent.submitter?.type === 'submit') {
      // 실제 저장 버튼을 클릭했을 때만 실행
      const isValid = await validateForm();
      if (!isValid) return;

      try {
        const updateData = {
          username: editedInfo.username,
          calendarApi: editedInfo.calendarApi,
          calendarId: editedInfo.calendarId
        };

        if (editedInfo.newPassword) {
          updateData.currentPassword = editedInfo.currentPassword;
          updateData.newPassword = editedInfo.newPassword;
        }

        const response = await axios.post('/bn/user/update', updateData, {
          withCredentials: true
        });

        if (response.status === 200) {
          alert('사용자 정보가 성공적으로 수정되었습니다.');
          setIsEditing(false);
          window.location.reload();
        }
      } catch (error) {
        console.error('사용자 정보 수정 중 오류 발생:', error);
        alert('사용자 정보 수정에 실패했습니다.');
      }
    }
  };

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
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-group mb-3">
              <label className="form-label w-100">사용자명</label>
              <input
                type="text"
                className="form-control"
                name="username"
                value={editedInfo.username}
                onChange={handleInputChange}
                disabled
              />
            </div>
            <div className="input-group mb-3">
              <label className="form-label w-100">캘린더 API</label>
              <input
                type="text"
                className="form-control"
                name="calendarApi"
                value={editedInfo.calendarApi}
                onChange={handleInputChange}
                placeholder="Google Calendar API 키를 입력하세요"
              />
            </div>
            <div className="input-group mb-3">
              <label className="form-label w-100">캘린더 ID</label>
              <input
                type="text"
                className="form-control"
                name="calendarId"
                value={editedInfo.calendarId}
                onChange={handleInputChange}
                placeholder="Google Calendar ID를 입력하세요"
              />
            </div>

            {/* 패스워드 변경 섹션 */}
            <div className="password-section mt-4">
              <h3 className="section-title">비밀번호 변경</h3>
              <div className="input-group mb-3">
                <label className="form-label w-100">현재 비밀번호</label>
                <div className="d-flex gap-2 check-password-block">
                  <input

                    type="password"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    name="currentPassword"
                    value={editedInfo.currentPassword}
                    onChange={handleInputChange}
                    onKeyPress={handlePasswordKeyPress}
                    placeholder="현재 비밀번호를 입력하세요"
                    disabled={passwordVerified}
                  />
                  <button
                    type="button"
                    className=" btn btn-secondary"
                    onClick={handleVerifyPassword}
                    disabled={passwordVerified}
                  >
                    확인
                  </button>
                </div>
                {errors.currentPassword && (
                  <div className="invalid-feedback">{errors.currentPassword}</div>
                )}
              </div>
              <div className="input-group mb-3">
                <label className="form-label w-100">새 비밀번호</label>
                <input
                  type="password"
                  className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  name="newPassword"
                  value={editedInfo.newPassword}
                  onChange={handleInputChange}
                  placeholder="새 비밀번호를 입력하세요"
                  disabled={!passwordVerified}
                />
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
              </div>
              <div className="input-group mb-3">
                <label className="form-label w-100">새 비밀번호 확인</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  name="confirmPassword"
                  value={editedInfo.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  disabled={!passwordVerified}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>
            </div>

            <div className="button-group mt-4">
              <button
                type="submit"
                className="save-button"
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  marginRight: '10px',
                  cursor: 'pointer'
                }}
              >
                저장
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
