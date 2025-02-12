import { useState, useEffect } from "react";
import "./css/SettingsModal.css";
import api from '../api/apiConfig';

const SettingsModal = ({
  years,
  months,
  selectedSettings,
  onSettingsUpdate,
  currentYear,
  currentMonth,
  onClose,
}) => {
  const [modalYear, setModalYear] = useState(currentYear);
  const [modalMonth, setModalMonth] = useState(currentMonth);

  useEffect(() => {
    const fetchInitialSettings = async () => {
      try {
        const response = await api.get(`/settings/get/${currentYear}/${currentMonth}`);
        const data = response.data;
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
        console.error("초기 설정을 가져오는 중 오류 발생:", error);
      }
    };

    fetchInitialSettings();
  }, []);

  useEffect(() => {
    fetchSettings(modalYear, modalMonth);
  }, [modalYear, modalMonth]);

  const handleSettingChange = (name, value) => {
    onSettingsUpdate({
      ...selectedSettings,
      [name]: value
    });
  };

  const handleYearChange = (e) => {
    setModalYear(e.target.value);
    onSettingsUpdate({
      ...selectedSettings,
      year: e.target.value,
    });
  };

  const handleMonthChange = (e) => {
    setModalMonth(e.target.value);
    onSettingsUpdate({
      ...selectedSettings,
      month: e.target.value,
    });
  };

  const fetchSettings = async (year, month) => {
    try {
      const response = await api.get(`/settings/get/${year}/${month}`);
      const data = response.data;
      onSettingsUpdate({
        year: data.year,
        month: data.month,
        layout: data.layout,
        imageArray: data.imageArray,
        defaultValue: data.defaultValue,
      });
    } catch (error) {
      console.error("설정 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  const handleLayoutChange = (e) => {
    onSettingsUpdate({
      ...selectedSettings,
      layout: e.target.value,
    });
  };

  const handleImageArrayChange = (e) => {
    onSettingsUpdate({
      ...selectedSettings,
      imageArray: e.target.value,
    });
  };

  const handleDownloadClick = async (e, option) => {
    e.preventDefault();
    try {
      let response;
      let filename;

      if (option === "월별 사진") {
        const year = selectedSettings.year;
        const month = String(selectedSettings.month).padStart(2, '0');
        response = await api.get(`/downloadAlbum/${year}/${month}`, {
          responseType: 'blob'
        });
        filename = `album_${year}_${month}.zip`;
      } else if (option === "전체 사진") {
        response = await api.get('/downloadAllAlbums', {
          responseType: 'blob'
        });
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        filename = `all_albums_${dateStr}.zip`;
      }

      const blob = new Blob([response.data]);
      if (blob.size === 0) {
        throw new Error(option === "월별 사진" ? 
          '해당 월에 다운로드할 사진이 없습니다.' : 
          '다운로드할 사진이 없습니다.'
        );
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      alert(`사진 다운로드 실패:\n${error.message}`);
    }
  };

  const handleApplyMonth = () => {
    onSettingsUpdate({
      ...selectedSettings,
      defaultValue: false,
    });
  };

  const handleApplyDefault = () => {
    onSettingsUpdate({
      ...selectedSettings,
      defaultValue: true,
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="settings-modal-overlay modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h5>환경설정</h5>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        <div className="setting-modal-body">
          <form>
            <div className="">
              
              <div className="item choose-yyyymm">
                <div className="year-display">
                  <input
                    type="text"
                    value={selectedSettings.year}
                    readOnly
                  />
                </div>
                <div className="month-display">
                  <input
                    type="text"
                    value={`${selectedSettings.month.toString().padStart(2, "0")}월`}
                    readOnly
                  />
                </div>
              </div>
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
                <div className="title"></div>
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
              <div className="item image-title">
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
              <div className="item download-title">
                <div className="title">다운로드</div>
              </div>
              <div className="item download-btn-block">
                <div className="item">
                  <button
                    className="download-button"
                    onClick={(e) => handleDownloadClick(e, "월별 사진")}
                  >
                    월별 사진 받기
                  </button>
                </div>
                <div className="item">
                  <button
                    className="download-button"
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
            className="apply-button"
            onClick={handleApplyDefault}
          >
            기본값 적용
          </button>
          <button
            className="apply-button"
            onClick={handleApplyMonth}
          >
            월 적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
