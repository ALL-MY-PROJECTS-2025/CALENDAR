import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar"; // //GOOGLE CALENDAR
import timeGridPlugin from "@fullcalendar/timegrid"; // timeGridPlugin 추가

import { Swiper, SwiperSlide } from "swiper/react";

// TIMER COMPONENT
import Timer from "./components/Timer";

// WEATHER COMPONENT
import Weather from "./components/Weather";

// UPLOAD MODAL
import UploadModal from "./components/UploadModal";

// Settings MODAL
import SettingsModal from "./components/SettingsModal";

import "swiper/css";
import "./Calendar.css";

function Calendar() {

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Bootstrap 모달 초기화 및 제어
  useEffect(() => {
    // Upload 모달
    const uploadModal = document.getElementById('staticBackdrop2');
    if (uploadModal && isUploadModalOpen) {
      const modal = new window.bootstrap.Modal(uploadModal);
      modal.show();
      
      // 모달이 닫힐 때 상태 업데이트
      uploadModal.addEventListener('hidden.bs.modal', () => {
        setIsUploadModalOpen(false);
      });
    }

    // Settings 모달
    const settingsModal = document.getElementById('staticBackdrop');
    if (settingsModal) {
      if (isSettingsModalOpen) {
        const bsModal = new window.bootstrap.Modal(settingsModal);
        bsModal.show();
        
        // 모달이 닫힐 때 상태 업데이트
        settingsModal.addEventListener('hidden.bs.modal', () => {
          setIsSettingsModalOpen(false);
        });
      }
    }
  }, [isUploadModalOpen, isSettingsModalOpen]);

  //----------------------------
  // STATE MANAGEMENT
  //----------------------------
  // Calendar Basic States
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const calendarRef = useRef(null);

  // 현재 날짜 계산 로직 수정
  const getCurrentMonthYear = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return { year, month };
  };

  const { year: currentYear, month: currentMonth } =
    getCurrentMonthYear(currentDate);

  // Google Calendar Modal States
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  // Image Management States
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Timer States
  const [currentTime, setCurrentTime] = useState("");
  const [currentDay, setCurrentDay] = useState("");

  // Settings States
  const [years] = useState(() => {
    // 현재 연도 기준 ±5년 배열 생성
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  });

  const [months] = useState(() => {
    // 1-12월 배열 생성
    return Array.from({ length: 12 }, (_, i) => i + 1);
  });

  const [selectedSettings, setSelectedSettings] = useState({
    year: currentYear,
    month: currentMonth,
    layout: "row",
    imageArray: "1",
    defaultValue: false,
  });

  //----------------------------
  // DATA FETCHING AND SETTINGS MANAGEMENT
  //----------------------------
  const fetchSettings = async (year, month) => {
    // 이전 요청과 동일한 요청인지 확인
    const requestKey = `${year}-${month}`;
    if (fetchSettings.lastRequest === requestKey) {
      return;
    }
    fetchSettings.lastRequest = requestKey;

    try {
      const response = await fetch(
        `http://localhost:8095/settings/get/${year}/${month}`
      );
      if (!response.ok) return;

      const data = await response.json();
      console.log("📌 서버 설정:", { year, month, ...data });

      setSelectedSettings({
        year: data.year,
        month: data.month,
        layout: data.layout,
        imageArray: data.imageArray,
        defaultValue: data.defaultValue,
      });
    } catch (error) {
      console.error("❌ 설정 데이터 오류:", error);
    }
  };

  // FullCalendar datesSet 이벤트 핸들러 수정
  const handleDatesSet = (dateInfo) => {
    const titleParts = dateInfo.view.title.split("년 ");
    const viewYear = parseInt(titleParts[0]);
    const viewMonth = parseInt(titleParts[1].replace("월", ""));

    if (isNaN(viewYear) || isNaN(viewMonth)) return;
    const newCurrentDate = new Date(viewYear, viewMonth - 1, 15);
    setCurrentDate(newCurrentDate);
  };

  // currentDate가 변경될 때마다 실행되는 useEffect
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // 유효한 날짜인지 확인
    if (isNaN(year) || isNaN(month)) return;

    fetchSettings(year, month);
  }, [currentDate]);

  // Settings 변경시 서버에 저장
  const handleSettingsUpdate = async (newSettings) => {
    try {
      if (newSettings.defaultValue !== null) {
        const response = await fetch("http://localhost:8095/settings/month", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSettings),
        });

        if (!response.ok) {
          throw new Error("설정 저장 실패");
        }

        setSelectedSettings(newSettings);
        if (
          newSettings.year !== selectedSettings.year ||
          newSettings.month !== selectedSettings.month
        ) {
          await fetchSettings(newSettings.year, newSettings.month);
        }
      }
    } catch (error) {
      console.error("❌ 설정 저장 오류:", error);
      alert("설정 저장 중 오류가 발생했습니다.");
    }
  };

  // 이미지 가져오기 useEffect 수정
  useEffect(() => {
    const fetchImagesFromServer = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // year와 month가 유효한지 확인
      if (isNaN(year) || isNaN(month)) return;

      const monthString = String(month).padStart(2, "0");

      try {
        const response = await fetch(
          `http://localhost:8095/getAlbum/${year}/${monthString}`
        );

        // 404 응답은 에러가 아닌 정상적인 "데이터 없음" 상태로 처리
        if (response.status === 404) {
          setImages([]);
          setPreviewImages([]);
          return;
        }

        // 다른 에러 응답 처리
        if (!response.ok) {
          setImages([]);
          setPreviewImages([]);
          return;
        }

        // 응답이 JSON인지 확인
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setImages([]);
          setPreviewImages([]);
          return;
        }

        const data = await response.json();

        if (data && Object.keys(data).length > 0) {
          const imageArray = Object.entries(data).map(([filename, base64]) => ({
            filename,
            base64: `data:image/jpeg;base64,${base64}`,
          }));

          setPreviewImages(imageArray.map((img) => img.base64));
          setImages(imageArray);
        } else {
          setImages([]);
          setPreviewImages([]);
        }
      } catch (error) {
        setImages([]);
        setPreviewImages([]);
      }
    };
    fetchImagesFromServer();
  }, [currentDate]);

  //----------------------------------------
  // TEST CODE( PUBLIC 내의이미지 가져와서 확인)
  //----------------------------------------

  // Fetch images for the current year and month
  // useEffect(() => {
  //   const fetchImages = async () => {
  //     const monthString = currentMonth.toString().padStart(2, "0");
  //     const folderPath = `${process.env.PUBLIC_URL}/images/${currentYear}/${monthString}`;

  //     try {
  //       // Fetch image list dynamically (simulate fetching)
  //       const response = await fetch(`${folderPath}/images.json`);
  //       if (response.ok) {
  //         const imageList = await response.json();
  //         setImages(imageList.map((img) => `${folderPath}/${img}`));
  //       } else {
  //         setImages([]); // Clear images if not available
  //       }
  //     } catch (error) {
  //       console.error("Error fetching images:", error);
  //       setImages([]);
  //     }
  //   };

  //   fetchImages();
  // }, [currentYear, currentMonth]);

  //----------------------------------------
  //FULLCALENDAR  + GOOGLE
  //----------------------------------------
  //GOOGLE MODAL
  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    setSelectedEvent(info.event);
    setShowEventModal(true);
  };
  //GOOGLE MODAL
  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  //GOOGLE MODAL 이벤트 시간 변경
  const convertToKST = (date) => {
    if (!date) return "시간 정보 없음";
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Seoul", // KST로 변환
    };
    return new Date(date).toLocaleString("ko-KR", options);
  };

  // 버튼 클릭 핸들러
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalOpen(false);
  };

  // 공휴일 판별 함수
  const isHoliday = (date) => {
    const day = date.getDay();
    // 주말(토,일) 체크
    if (day === 0 || day === 6) return true;
    
    // 공휴일 목록 (YYYY-MM-DD 형식)
    const holidays = [
      "2024-01-01",  // 신정
      "2024-02-09",  // 설날
      "2024-02-10",
      "2024-02-11",
      "2024-03-01",  // 삼일절
      "2024-05-05",  // 어린이날
      "2024-05-15",  // 석가탄신일
      "2024-06-06",  // 현충일
      "2024-08-15",  // 광복절
      "2024-09-16",  // 추석
      "2024-09-17",
      "2024-09-18",
      "2024-10-03",  // 개천절
      "2024-10-09",  // 한글날
      "2024-12-25",  // 크리스마스
    ];

    const dateString = date.toISOString().split('T')[0];
    return holidays.includes(dateString);
  };

  return (
    <div
      className={`App ${selectedSettings.layout === "row" ? "layout-row" : "layout-col"
        }`}
    >
      <div className="photo-frame">
        {/* SLIDE 없이 배치 */}
        {images.length > 0 ? (
          <div className="items">
            {images.map((img, index) => (
              <div key={index} className="item">
                <img
                  src={img.base64}
                  alt={img.filename}
                  className="month-image"
                />
                <video autoPlay muted loop>
                  <source src="https://mcard.fromtoday.co.kr/mcard/assets/flower_00.mp4" />
                </video>
              </div>
            ))}
          </div>
        ) : (
          <div className="items">
            <div className="item">
              <img
                src={`${process.env.PUBLIC_URL}/images/default.png`}
                alt="Default Image"
                className="month-image default-image"
              />
            </div>
          </div>
        )}
      </div>

      <div className="postcard-container">
        <div className="calendar-header">
          <Weather />
          {/*  */}
          <Timer />
        </div>

        <div className="controller">
          <button onClick={handleUploadClick}>
            <span className="material-symbols-outlined">upload</span>
          </button>
          <button onClick={handleSettingsClick}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <div className="calendar-container" style={{}}>
          {/*  */}
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              interactionPlugin,
              googleCalendarPlugin,
              timeGridPlugin,
            ]} // 플러그인 추가
            initialView="dayGridMonth"
            headerToolbar={{
              right: "prev,next today", // 이전/다음 버튼과 오늘 버튼
              center: "title", // 중앙에 제목(예: "January 2025")
              left: "dayGridMonth,timeGridWeek,timeGridDay", // 월, 주, 일 보기 버튼
            }}
            buttonText={{
              today: "TODAY",
              month: "월",
              week: "주",
              day: "일",
            }} // 버튼 텍스트를 한글로 변경
            googleCalendarApiKey="AIzaSyA_rJ5q1Jjde3tdinjhSUx9m-ZbpCSkS58" // API 키 설정
            events={{
              googleCalendarId:
                "505ad0eb41755b07ffaab2b3b77c58ab9c34e6f6b38d619b3894a5816d162004@group.calendar.google.com", // Google Calendar ID
            }}
            initialDate={currentDate}
            datesSet={handleDatesSet}
            dateClick={(info) => {
              // console.log 제거
            }}
            //GOOGLE CALENDAR(// npm install @fullcalendar/google-calendar)
            eventClick={handleEventClick} // !!! 이벤트 클릭 핸들러 추가
            locale="ko" // 한글로 설정
            height="auto" // 자동으로 화면 크기에 맞게 조정
           
            dayCellContent={(args) => {
              const day = args.date.getDay();
              // dayNumberText에서 '일' 제거
              const dayNumber = args.dayNumberText.replace('일', '');
              return (
                <div
                  style={{
                    color: day === 0 ? 'red' : day === 6 ? '#1E2B37' : 'inherit',
                    textAlign: 'center'
                  }}
                >
                  {dayNumber}
                </div>
              );
            }}
            dayHeaderContent={(args) => {
              const day = args.date.getDay();
              return (
                <div
                  style={{
                    color: day === 0 ? 'red' : day === 6 ? '#1E2B37' : 'inherit',
                    textAlign: 'center'
                  }}
                >
                  {args.text}
                </div>
              );
            }}
          />
        </div>

        {/* GOOGLE EVENT MODAL        */}
        {showEventModal && selectedEvent && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedEvent.title || "이벤트 정보 없음"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeModal}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div
                    className="img-block"
                    style={{
                      width: "100%",
                      height: "450px",
                      aspectRatio: "16 / 9",
                    }}
                  >
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "100% 10%",
                      }}
                      src={`${process.env.PUBLIC_URL}/modal_1.png`}
                      alt="Example"
                    />
                    <video autoPlay muted loop>
                      <source src="https://mcard.fromtoday.co.kr/mcard/assets/flower_01.mp4" />
                    </video>
                  </div>
                  <div className="modal-schedule">
                    <div>
                      <strong>일정 시작:</strong>{" "}
                      {convertToKST(selectedEvent.start)}
                    </div>
                    <div>
                      <strong>일정 끝:</strong>{" "}
                      {convertToKST(selectedEvent.end) || "종료 시간 없음"}
                    </div>
                    <div>
                      <strong>설명:</strong>{" "}
                      {selectedEvent.extendedProps.description || "설명 없음"}
                    </div>
                    <div>
                      <strong>위치:</strong>{" "}
                      {selectedEvent.extendedProps.location || "위치 정보 없음"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* END */}

        {/* SETTING Modal */}
        {isSettingsModalOpen && (
          <SettingsModal
            years={years}
            months={months}
            selectedSettings={selectedSettings}
            onSettingsUpdate={handleSettingsUpdate}
            currentYear={currentYear}
            currentMonth={currentMonth}
            onClose={handleCloseSettingsModal}
          />
        )}
        {/* END */}

        {/* UPLOAD MODAL */}
        {isUploadModalOpen && (
          <UploadModal
            currentDate={currentDate}
            images={images}
            setImages={setImages}
            previewImages={previewImages}
            setPreviewImages={setPreviewImages}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            onClose={handleCloseUploadModal}
          />
        )}
        {/* END */}
      </div>
    </div>
  );
}

export default Calendar;
