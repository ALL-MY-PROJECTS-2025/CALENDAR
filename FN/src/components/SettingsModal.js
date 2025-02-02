import { useState, useEffect } from "react";
import "./css/SettingsModal.css";

const SettingsModal = ({ years, setYears, months, setMonths, selectedSettings, setSelectedSettings }) => {

  const [modalYear, setModalYear] = useState(selectedSettings.year)
  const [modalmonths, setModalmonths] = useState(selectedSettings.month)
  //-----------------------------------

  //-----------------------------------
  // 연도 및 월 데이터 초기화
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYears(Array.from({ length: 11 }, (_, i) => currentYear - 5 + i));
    setMonths(Array.from({ length: 12 }, (_, i) => i + 1));
  }, []);

  //-----------------------------------
  // 연도 및 월 변경 시 초기화
  //-----------------------------------
  useEffect(() => {
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!",modalYear,modalmonths)
    fetchSettings(modalYear, modalmonths);
  }, [modalYear,modalmonths])

  const handleYearChange = (e) => {

    fetchSettings(modalYear, modalmonths);
  };

  const handleMonthChange = (e) => {

    fetchSettings(modalYear, modalmonths);
  };

  const fetchSettings = async (year, month) => {
    console.log("upload modal's fetchSettings func ...",year,month);
    try {
      const response = await fetch(`http://localhost:8095/settings/get/${year}/${month}`);
      if (!response.ok) {
        console.warn("⚠️ 서버에서 설정을 가져올 수 없음. 기본 설정 사용.");
        
      }
      const data = await response.json();
      console.log("📌 서버에서 가져온 설정:", data);

      // 가져온 데이터를 상태에 저장
      setSelectedSettings({
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
    setSelectedSettings((prev) => ({
      ...prev,
      layout: e.target.value,
    }));
  };

  // 이미지 배열 변경 핸들러
  const handleImageArrayChange = (e) => {
    setSelectedSettings((prev) => ({
      ...prev,
      imageArray: e.target.value,
    }));
  };

  //-----------------------------------
  // 다운로드 버튼 클릭 핸들러
  //-----------------------------------
  const handleDownloadClick = (option) => {
    console.log("download btn clicked..");
  };

  //-----------------------------------
  //월 저장 핸들러
  //-----------------------------------
  const handleApplyMonth = () => {
    setSelectedSettings((prev) => ({
      ...prev,
      defaultValue: false,
    }));
  };

  //-----------------------------------
  //기본값  저장 핸들러
  //-----------------------------------
  const handleApplyDefault = () => {
    setSelectedSettings((prev) => ({
      ...prev,
      defaultValue: true,
    }));
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
            <div className="items">
              {/* YYYY/MM 정보 선택 */}
              <div className="item choose-yyyymm">
                <label htmlFor="yearSelect"></label>
                <select
                  id="yearSelect"
                  className="form-select"
                  value={selectedSettings.year}
                  onChange={e => { 
                    setModalYear(e.target.value) 
                  }}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <label htmlFor="monthSelect"></label>
                <select
                  id="monthSelect"
                  className="form-select"
                  value={selectedSettings.month}
                  onChange={e => { 
                    setModalmonths(e.target.value) 
                  }}
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month.toString().padStart(2, "0")}월
                    </option>
                  ))}
                </select>
              </div>
              <hr />

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
              <hr />

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

              <hr />

              {/* 내려받기 */}
              <div className="item">
                <div className="title">다운로드</div>
              </div>
              <div className="item download">
                <div className="item">
                  <button
                    className="btn"
                    onClick={() => handleDownloadClick("월별 사진")}
                  >
                    월별 사진 받기
                  </button>
                </div>
                <div className="item">
                  <button
                    className="btn"
                    onClick={() => handleDownloadClick("전체 사진")}
                  >
                    전체 사진 받기
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                handleApplyDefault(e);
              }}
            >
              기본값 적용
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                handleApplyMonth(e);
              }}
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
