import React, { useState, useEffect } from 'react';
import './css/Location.css';

const Location = ({ isOpen, onClose, onSave, currentLocation }) => {
  const [address, setAddress] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [error, setError] = useState('');

  // Daum 주소검색 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    
    // 스크립트가 이미 로드되어 있는지 확인
    if (!document.querySelector('script[src="' + script.src + '"]')) {
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }

    return () => {
      // cleanup 함수에서는 스크립트를 제거하지 않습니다.
      // 다른 컴포넌트에서도 사용할 수 있기 때문입니다.
    };
  }, []);

  // 모달이 열릴 때 현재 위치 정보를 입력창에 설정
  useEffect(() => {
    if (isOpen && currentLocation) {
      setAddress(currentLocation);
    }
  }, [isOpen, currentLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('주소를 입력해주세요.');
      return;
    }
    onSave(address);
    onClose();
  };

  // Daum 주소검색 실행 함수
  const handleSearchAddress = () => {
    if (!isScriptLoaded) {
      alert('주소검색 서비스를 불러오는 중입니다. 잠시만 기다려주세요.');
      return;
    }

    const daum = window.daum;
    if (!daum || !daum.Postcode) {
      alert('주소검색 서비스를 사용할 수 없습니다.');
      return;
    }

    new daum.Postcode({
      oncomplete: function(data) {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        console.log('선택된 주소:', fullAddress);
        setAddress(fullAddress);
      }
    }).open();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} id="locationModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">위치 설정</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    id="location-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="주소 검색을 클릭하세요"
                    readOnly
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={handleSearchAddress}
                    disabled={!isScriptLoaded}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'middle' }}>
                      search
                    </span>
                    주소 검색
                  </button>
                </div>
                {error && <div className="text-danger mt-2">{error}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={!address}
              >
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Location; 