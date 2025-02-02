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

  //----------------------------
  // 
  //----------------------------
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const calendarRef = useRef(null); // FullCalendar를 제어하기 위한 ref

  // 이벤트표시모달(GOOGLE CALENDAR)
  const [selectedEvent, setSelectedEvent] = useState(null); // !!! 선택된 이벤트 정보
  const [showEventModal, setShowEventModal] = useState(false); // !!! 모달 표시 여부

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();


  //----------------------------
  // UploadModal.js State
  //----------------------------
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]); // 미리보기 이미지 리스트
  const [uploadedImages, setUploadedImages] = useState([]); // 업로드된 이미지 리스트
  //----------------------------

  //----------------------------
  // Timer.js  State
  //----------------------------
  const [currentTime, setCurrentTime] = useState(""); //  현재 시간을 저장
  const [currentDay, setCurrentDay] = useState(""); //  현재 요일과 날짜 저장
  //----------------------------

  //----------------------------
  // SettingsModel.js State 
  //----------------------------
  // 연도 및 월 상태 관리
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedSettings, setSelectedSettings] = useState({})
  // 상태를 객체로 관리
  // const [selectedSettings, setSelectedSettings] = useState({
  //   year: new Date().getFullYear(),
  //   month: new Date().getMonth() + 1, // 월은 0부터 시작하므로 +1
  //   layout: "row",
  //   imageArray: "1",
  //   defaultValue: false,
  // });
  useEffect(()=>{
    const currentMonth = currentDate.getMonth() + 1;
    setYears(currentDate.getFullYear())
    
  },[])

  //-----------------------------------
  // 연도 및 월 변경 시 서버에서 설정 값 가져오기!!!!!!!!!!!
  //-----------------------------------
  useEffect(() => {
    fetchSettings(currentYear, currentMonth)
  }, [currentYear, currentMonth]); // 현재 연월이 변경될 때 실행

  const fetchSettings = async (year, month) => {
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


  //-------------------------------
  // Settings 변경시 서버에 저장
  //-------------------------------
  useEffect(() => {
    if (selectedSettings.defaultValue !== null) {
      handleFetch();
    }
  }, [selectedSettings]);

  const handleFetch = async () => {
    console.log("서버로 전송할 데이터:", selectedSettings);
    try {
      const response = await fetch("http://localhost:8095/settings/month", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedSettings),
      });
      if (response.ok) {
        // alert("설정을 저장했습니다.");
      }
    } catch (error) {
      console.error("월 설정 적용 오류:", error);
      alert("월 설정 적용 중 오류가 발생했습니다.");
    }
  };
  //-------------------------------

  //----------------------------
  // 서버에서 Base64 이미지 목록을 가져오는 함수
  //----------------------------
  useEffect(() => {
    const fetchImagesFromServer = async () => {
      try {
        const response = await fetch(
          `http://localhost:8095/getAlbum/${currentYear}/${String(
            currentMonth
          ).padStart(2, "0")}`
        );

        // 🔹 응답이 정상적인지 확인
        if (!response.ok) {
          console.warn("⚠️ 서버 응답 오류:", response.status);
          setImages([]); // 초기화
          setPreviewImages([]);
          return;
        }

        // 🔹 응답이 JSON인지 체크 (빈 응답이면 JSON 파싱 X)
        const contentType = response.headers.get("content-type");
        const contentLength = response.headers.get("content-length");

        if (
          !contentType ||
          !contentType.includes("application/json") ||
          contentLength === "0"
        ) {
          console.warn("⚠️ 서버 응답이 비어 있거나 JSON이 아님");
          setImages([]); // 이미지 초기화
          setPreviewImages([]);
          return;
        }

        const data = await response.json();
        console.log("📌 가져온 이미지 데이터:", data);

        if (data && Object.keys(data).length > 0) {
          const imageArray = Object.entries(data).map(([filename, base64]) => ({
            filename,
            base64: `data:image/jpeg;base64,${base64}`,
          }));

          setPreviewImages(imageArray.map((img) => img.base64)); // ✅ 미리보기 업데이트
          setImages(imageArray); // 이미지 상태 업데이트
        } else {
          console.warn("⚠️ 서버에서 받은 데이터가 없음");
          setImages([]);
        }
      } catch (error) {
        console.error("❌ 이미지 데이터를 가져오는 중 오류 발생:", error);
        setImages([]);
        setPreviewImages([]);
      }
    };
    fetchImagesFromServer();
  }, [currentYear, currentMonth]); // 현재 년/월이 변경될 때 실행


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
    info.jsEvent.preventDefault(); // !!! 기본 동작 방지
    setSelectedEvent(info.event); // !!! 선택한 이벤트 정보 저장
    setShowEventModal(true); // !!! 모달 표시
    console.log("!!!!!!!! 이벤트 클릭:", info.event);
  };
  //GOOGLE MODAL
  const closeModal = () => {
    setShowEventModal(false); // !!! 모달 숨김
    setSelectedEvent(null); // !!! 선택한 이벤트 초기화
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

  return (
    <div className="App">
      {/*  */}
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
          <Timer />
          {/*  */}
          <Weather />
        </div>

        <div className="controller">
          <button
            type="button"
            className="btn btn-primary upload-btn"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop2"
          >
            <span className="material-symbols-outlined">upload</span>
          </button>

          <button
            type="button"
            className="btn btn-primary setting-btn"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
          >
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
            initialDate={currentDate.toISOString().split("T")[0]}
            datesSet={(dateInfo) => {
              const newDate = new Date(dateInfo.startStr);
              const viewCenterDate = new Date(
                newDate.getFullYear(),
                newDate.getMonth() + 1,
                15 // 매달 중앙 날짜로 설정
              );
              setCurrentDate(viewCenterDate);
            }}
            dateClick={(info) => {
              console.log("clicked...", info.date);
            }}
            //GOOGLE CALENDAR(// npm install @fullcalendar/google-calendar)
            eventClick={handleEventClick} // !!! 이벤트 클릭 핸들러 추가
            locale="ko" // 한글로 설정
            height="auto" // 자동으로 화면 크기에 맞게 조정
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
        <SettingsModal
          years={years}
          setYears={setYears}
          months={months}
          setMonths={setMonths}
          selectedSettings={selectedSettings}
          setSelectedSettings={setSelectedSettings}
        />
        {/* END */}

        {/* UPLOAD MODAL */}
        <UploadModal
          currentDate={currentDate}
          images={images}
          setImages={setImages}
          previewImages={previewImages}
          setPreviewImages={setPreviewImages}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
        />
        {/* END */}
      </div>
    </div>
  );
}

export default Calendar;
