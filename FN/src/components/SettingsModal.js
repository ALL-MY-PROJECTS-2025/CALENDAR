import { useState, useEffect } from 'react';
import "./css/SettingsModal.css";


const SettingsModal = () => {
  // 연도 및 월 상태 관리
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 월은 0부터 시작하므로 +1

  // 연도 및 월 데이터를 초기화하는 useEffect
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    // 현재 연도 ±5년 범위 설정 (총 11개)
    setYears(Array.from({ length: 11 }, (_, i) => currentYear - 5 + i));
    // 1~12월 설정
    setMonths(Array.from({ length: 12 }, (_, i) => i + 1));
  }, []);

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
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <label htmlFor="monthSelect" style={{}}></label>
                <select
                  id="monthSelect"
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
                  <input type="radio" name="layout" value="row" />
                </div>
                <div className="colLayout">
                  <input type="radio" name="layout" value="col" />
                </div>
              </div>
              <hr />

              {/* 이미지 배치 설정 */}
              <div className="item choose-image-array">
                <div className="title">배치형태</div>
                
                <div className="array-1">
                  <div></div>
                </div>
                
                <div className="array-2-row">
                  <div></div>
                  <div></div>
                </div>
                
                <div className="array-2-col">
                  <div></div>
                  <div></div>
                </div>
                
                <div className="array-4">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>

              </div>

              <hr />

              {/* 내려받기 */}
              <div className="item download">
                  내려받기블럭
              </div>

            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary">
              전체적용
            </button>
            <button type="button" className="btn btn-primary">
              월 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
