import { useState, useEffect } from "react";
import "./css/SettingsModal.css";
import { API_URLS } from '../api/apiConfig';
import axios from 'axios';

const SettingsModal = ({
  years,
  months,
  selectedSettings,
  onSettingsUpdate,
  currentYear,
  currentMonth,
  onClose,
}) => {
  // years와 months는 이제 props로만 사용
  // setYears, setMonths 사용하지 않음

  const [modalYear, setModalYear] = useState(currentYear);
  const [modalMonth, setModalMonth] = useState(currentMonth);
  //-----------------------------------

  //-----------------------------------
  // 연도 및 월 데이터 초기화
  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const response = await fetch(
          API_URLS.settings.get(currentYear, currentMonth)
        );
        if (!response.ok) {
          console.warn("⚠️ 서버에서 설정을 가져올 수 없음. 기본 설정 사용.");
          return;
        }
        const data = await response.json();
        console.log("📌 서버에서 가져온 초기 설정:", data);

        setModalYear(data.year);
        setModalMonth(data.month);
        onSettingsUpdate({
          year: data.year,
          month: data.month,
          layout: data.layout,
          imageArray: data.imageArray,
          defaultValue: data.defaultValue,
        });
      } catch (error) {
        console.error("❌ 초기 설정을 가져오는 중 오류 발생:", error);
      }
    };

    fetchInitialSettings();
  }, []);

  //-----------------------------------
  // 연도 및 월 변경 시 초기화
  //-----------------------------------
  useEffect(() => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!",modalYear,modalMonth)
    fetchSettings(modalYear, modalMonth);
  }, [modalYear,modalMonth])

  useEffect(() => {
    // 컴포넌트가 언마운트될 때 backdrop 제거
    return () => {
      const backdrops = document.getElementsByClassName('modal-backdrop');
      if (backdrops.length > 0) {
        Array.from(backdrops).forEach(backdrop => {
          document.body.removeChild(backdrop);
        });
      }
      // body에서 modal-open 클래스도 제거
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleSettingChange = (name, value) => {
    onSettingsUpdate({
      ...selectedSettings,
      [name]: value
    });
  };

  const handleYearChange = (e) => {
    setModalYear(e.target.value);
    const newSettings = {
      ...selectedSettings,
      year: e.target.value,
    };
    onSettingsUpdate(newSettings);
  };

  const handleMonthChange = (e) => {
    setModalMonth(e.target.value);
    const newSettings = {
      ...selectedSettings,
      month: e.target.value,
    };
    onSettingsUpdate(newSettings);
  };

  const fetchSettings = async (year, month) => {
    console.log("upload modal's fetchSettings func ...",year,month);
    try {
      const response = await fetch(API_URLS.settings.get(year, month));
      if (!response.ok) {
        console.warn("⚠️ 서버에서 설정을 가져올 수 없음. 기본 설정 사용.");
      }
      const data = await response.json();
      console.log("📌 서버에서 가져온 설정:", data);

      onSettingsUpdate({
        year: data.year,
        month: data.month,
        layout: data.layout,
        imageArray: data.imageArray,
        defaultValue: data.defaultValue,
      });

    } catch (error) {
      console.error("❌ 설정 데이터를 가져오는 중 오류 발생:", error);
    }
  };
  //-----------------------------------




  // 레이아웃 변경 핸들러
  const handleLayoutChange = (e) => {
    const newSettings = {
      ...selectedSettings,
      layout: e.target.value,
    };
    onSettingsUpdate(newSettings);
  };

  // 이미지 배열 변경 핸들러
  const handleImageArrayChange = (e) => {
    const newSettings = {
      ...selectedSettings,
      imageArray: e.target.value,
    };
    onSettingsUpdate(newSettings);
  };

  //-----------------------------------
  // 다운로드 버튼 클릭 핸들러
  //-----------------------------------
  const handleDownloadClick = async (e, option) => {
    e.preventDefault();
    
    try {
      if (option === "월별 사진") {
        const year = selectedSettings.year;
        const month = String(selectedSettings.month).padStart(2, '0');
        
        console.log(`📌 월별 사진 다운로드 시도: ${year}년 ${month}월`);
        
        const response = await fetch(API_URLS.album.download(year, month), {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`다운로드 실패 (${response.status}): ${response.statusText}`);
        }

        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('⚠️ 해당 월에 다운로드할 사진이 없습니다.');
        }

        // 다운로드 처리
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `album_${year}_${month}.zip`;
        
        document.body.appendChild(a);
        a.click();
        
        // cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ 다운로드 완료');

      } else if (option === "전체 사진") {
        alert('전체 사진 다운로드 기능은 아직 준비중입니다.');
      }

    } catch (error) {
      console.error('❌ 다운로드 중 오류 발생:', error);
      alert(`❌ 사진 다운로드 실패:\n${error.message}`);
    }
  };

  //-----------------------------------
  //월 저장 핸들러
  //-----------------------------------
  const handleApplyMonth = () => {
    const newSettings = {
      ...selectedSettings,
      defaultValue: false,
    };
    onSettingsUpdate(newSettings);
  };

  //-----------------------------------
  //기본값  저장 핸들러
  //-----------------------------------
  const handleApplyDefault = () => {
    const newSettings = {
      ...selectedSettings,
      defaultValue: true,
    };
    onSettingsUpdate(newSettings);
  };

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();  // 폼 기본 동작 방지
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_URLS.settings.update, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...selectedSettings,
          defaultValue: true,
        }),
      });

      if (!response.ok) {
        throw new Error("설정 저장 실패");
      }

      onClose();
    } catch (error) {
      console.error("설정 저장 중 오류:", error);
      alert("설정 저장에 실패했습니다.");
    }
  };

  return (
    <div
      className="modal fade settingmodal"
      id="staticBackdrop"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog  modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="staticBackdropLabel">
              환경설정
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleFormSubmit}>
              <div className="items">
                {/* YYYY/MM 정보 표시 */}
                <div className="item choose-yyyymm">
                  <div className="year-display">
                    <input
                      type="text"
                      value={selectedSettings.year}
                      readOnly
                      className="form-control"
                    />
                  </div>
                  <div className="month-display">
                    <input
                      type="text"
                      value={`${selectedSettings.month.toString().padStart(2, "0")}월`}
                      readOnly
                      className="form-control"
                    />
                  </div>
                </div>
                

                {/* 레이아웃 설정 */}
                <div className="item choose-layout">
                  <div className="title">레이아웃</div>
                  <div className="rowLayout">
                    <div className="imageblock">이미지</div>
                    <div className="contentblock">달력</div>
                  </div>
                  <div className="colLayout">
                    <div className="imageblock">이미지</div>
                    <div className="contentblock">달력</div>
                  </div>
                </div>

                <div className="item choose-layout-radio">
                  <div className="title">선택</div>
                  <div className="rowLayout">
                    <input
                      type="radio"
                      name="layout"
                      value="row"
                      checked={selectedSettings.layout === "row"}
                      onChange={handleLayoutChange}
                    />
                  </div>
                  <div className="colLayout">
                    <input
                      type="radio"
                      name="layout"
                      value="col"
                      checked={selectedSettings.layout === "col"}
                      onChange={handleLayoutChange}
                    />
                  </div>
                </div>
                

                  {/* 이미지 배치 설정 */}
                  <div className="item">
                    <div className="title">이미지 배치 설정</div>
                  </div>
                  <div className="item choose-image-array">
                    <div className="array-1">
                      <input
                        type="radio"
                        name="array"
                        value="1"
                        checked={selectedSettings.imageArray === "1"}
                        onChange={handleImageArrayChange}
                      />
                      <div></div>
                    </div>

                    <div className="array-2-row">
                      <input
                        type="radio"
                        name="array"
                        value="2-row"
                        checked={selectedSettings.imageArray === "2-row"}
                        onChange={handleImageArrayChange}
                      />
                      <div></div>
                      <div></div>
                    </div>

                    <div className="array-2-col">
                      <input
                        type="radio"
                        name="array"
                        value="2-col"
                        checked={selectedSettings.imageArray === "2-col"}
                        onChange={handleImageArrayChange}
                      />
                      <div></div>
                      <div></div>
                    </div>

                    <div className="array-4">
                      <input
                        type="radio"
                        name="array"
                        value="4"
                        checked={selectedSettings.imageArray === "4"}
                        onChange={handleImageArrayChange}
                      />
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>

              

                {/* 내려받기 */}
                <div className="item">
                  <div className="title">다운로드</div>
                </div>
                <div className="item download">
                  <div className="item">
                    <button
                      className="btn"
                      onClick={(e) => handleDownloadClick(e, "월별 사진")}
                    >
                      월별 사진 받기
                    </button>
                  </div>
                  <div className="item">
                    <button
                      className="btn"
                      onClick={(e) => handleDownloadClick(e, "전체 사진")}
                    >
                      전체 사진 받기
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApplyDefault}
            >
              기본값 적용
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApplyMonth}
            >
              월 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
