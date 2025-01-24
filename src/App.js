import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar"; // //GOOGLE CALENDAR
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "./App.css";

function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [images, setImages] = useState([]); // State to hold images for the current month
  const calendarRef = useRef(null); // FullCalendar를 제어하기 위한 ref

  // 이벤트표시모달(GOOGLE CALENDAR)
  const [selectedEvent, setSelectedEvent] = useState(null); // !!! 선택된 이벤트 정보
  const [showEventModal, setShowEventModal] = useState(false); // !!! 모달 표시 여부

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // 미리보기 이미지 리스트
  const [previewImages, setPreviewImages] = useState([]); // 미리보기 이미지 리스트
  const [uploadedImages, setUploadedImages] = useState([]); // 업로드된 이미지 리스트

  const handlePrevMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev(); // FullCalendar의 이전 달로 이동
      const currentCenterDate = new Date(
        calendarApi.getDate().getFullYear(),
        calendarApi.getDate().getMonth(),
        15 // 중앙 날짜(15일)로 설정
      );
      setCurrentDate(currentCenterDate);
      console.log(
        `!!!!!!!!!!!!!!! 이전 달 이동: ${currentCenterDate.toISOString().split("T")[0]
        }`
      );
    }
  };

  const handleNextMonth = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next(); // FullCalendar의 다음 달로 이동
      const currentCenterDate = new Date(
        calendarApi.getDate().getFullYear(),
        calendarApi.getDate().getMonth(),
        15 // 중앙 날짜(15일)로 설정
      );
      setCurrentDate(currentCenterDate);
      console.log(
        `!!!!!!!!!!!!!!! 다음 달 이동: ${currentCenterDate.toISOString().split("T")[0]
        }`
      );
    }
  };

  const handleToday = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today(); // FullCalendar의 오늘 날짜로 이동
      const todayDate = new Date(
        calendarApi.getDate().getFullYear(),
        calendarApi.getDate().getMonth(),
        15 // 중앙 날짜(15일)로 설정
      );
      setCurrentDate(todayDate); // 상태 동기화
      console.log(
        `!!!!!!!!!!!!!!! 오늘 날짜로 이동: ${todayDate.toISOString().split("T")[0]
        }`
      );
    }
  };

  // Fetch images for the current year and month
  useEffect(() => {
    const fetchImages = async () => {
      const monthString = currentMonth.toString().padStart(2, "0");
      const folderPath = `/images/${currentYear}/${monthString}`;

      try {
        // Fetch image list dynamically (simulate fetching)
        const response = await fetch(`${folderPath}/images.json`);
        if (response.ok) {
          const imageList = await response.json();
          setImages(imageList.map((img) => `${folderPath}/${img}`));
        } else {
          setImages([]); // Clear images if not available
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
      }
    };

    fetchImages();
  }, [currentYear, currentMonth]);

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

  // UPLOAD MODAL 드래그시 스타일링
  const handleUploadModalDragEnter = (e) => {
    e.target.setAttribute(
      "style",
      "border: 1px dotted lightgray;color:lightgray;"
    );
  };
  const handleUploadModalDragLeave = (e) => {
    e.target.setAttribute("style", "border: 1px  dotted gray;color:gray;");
  };

  //
  // 파일을 드롭했을 때 처리하는 핸들러
  const handleFileDrop = (e) => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // !!!!!!!!!!!!!! 미리보기와 업로드 파일 리스트 분리
    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages(previewUrls); // 미리보기용 URL 저장
    setUploadedImages(imageFiles); // 실제 업로드용 파일 객체 저장
  };

  // 업로드 버튼 클릭 시 호출
  const handleUpload = async () => {
    if (previewImages.length === 0) {
      alert("업로드할 이미지가 없습니다.");
      return;
    }

    // 기존 업로드된 이미지를 상태에 저장
    setUploadedImages(previewImages);
    //GITHUB ACTION을 이용해서 다른 REPOSITORY 로 전달할예정 PRIVATE to PRIVATE REPOSITORY 가능한지 확인할 것


    // FormData에 파일 추가
    const formData = new FormData();
    previewImages.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    // GITHUB ACTION
    // GitHub Actions를 트리거하는 API 호출
    try {
      // const response = await fetch("https://api.github.com/repos/<YOUR_USERNAME>/<REPO_NAME>/actions/workflows/target-repo-upload.yml/dispatches", {
      const response = await fetch(
        "https://api.github.com/repos/ALL-MY-PROJECTS-2025/CALENDAR/", // 업로드 디렉토리 경로,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer `, // PAT
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify(
            uploadedImages.map((file) => ({
              message: `Upload ${file.name}`,
              content: file, // 파일을 Base64로 변환하여 전달 필요
              branch: "main", // 업로드할 브랜치
            }))
          ),
        }
      );

      if (response.ok) {
        console.log("GitHub Actions 트리거 성공");
        alert("이미지 업로드가 요청되었습니다.");
      } else {
        console.error("GitHub Actions 트리거 실패", response);
        alert("업로드 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }

    // 서버에 업로드 요청 처리 (여기서는 콘솔로 시뮬레이션)
    console.log("업로드된 이미지:", previewImages);

    // 업로드 요청 후 미리보기 이미지 초기화
    setPreviewImages([]);
  };

  // 특정 이미지를 제거하는 함수
  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index)); // 선택한 이미지 제외
  };

  return (
    <div className="App">
      <div className="postcard-container">
        <div className="controller">
          <button
            type="button"
            className="btn btn-primary setting-btn"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <button
            type="button"
            className="btn btn-primary upload-btn"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop2"
          >
            <span className="material-symbols-outlined">upload</span>
          </button>
        </div>

        <div className="photo-frame">
          {/* SWIPER 를 사용한 슬라이드 구현 */}
          {/* {images.length > 0 ? (
            <Swiper
              spaceBetween={0}
              slidesPerView={1}
              // effect="fade"
              autoplay={{
                delay: 1000,
                disableOnInteraction: false,
              }}
            >
              {images.map((img, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={img}
                    alt={`${currentYear}년 ${currentMonth}월 이미지 ${index + 1}`}
                    className="month-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default.png';
                      e.target.className = 'month-image default-image';
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <img
              src='/images/default.png'
              alt='Default Image'
              className='month-image default-image'
            />
          )} */}

          {/* SLIDE 없이 배치 */}

          {images.length > 0 ? (
            <div className="items">
              {images.map((img, index) => (
                <div key={index} className="item">
                  <img
                    src={img}
                    alt={`${currentYear}년 ${currentMonth}월 이미지 ${index + 1
                      }`}
                    className="month-image"
                  />
                  <video autoPlay muted loop>
                      <source src="https://mcard.fromtoday.co.kr/mcard/assets/flower_00.mp4" />
                  </video>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ objectFit: "cover" }}>
              <img
                style={{ width: "100vw", height: "40vh", objectFit: "contain" }}
                src="/images/default.png"
                alt="Default Image"
                className="month-image default-image"
              />
            </div>
          )}
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="nav-button">
              <span className="material-symbols-outlined">arrow_left</span>
            </button>
            <h2>
              {currentYear}년 {currentMonth}월
            </h2>
            <button onClick={handleNextMonth} className="nav-button">
              <span className="material-symbols-outlined">arrow_right</span>
            </button>
            <button onClick={handleToday} className="today-button">
              오늘
            </button>
          </div>

          {/*  */}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin, googleCalendarPlugin]} // 플러그인 추가
            initialView="dayGridMonth"
            headerToolbar={false}
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

              console.log(
                `!!!!!!!!!!!!!!! FullCalendar 날짜 설정 (중앙 날짜): ${viewCenterDate.toISOString().split("T")[0]
                }`
              );
            }}
            dateClick={(info) => {
              console.log("clicked...", info.date);
            }}
            //GOOGLE CALENDAR(// npm install @fullcalendar/google-calendar)
            eventClick={handleEventClick} // !!! 이벤트 클릭 핸들러 추가
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
                  <div className="img-block">
                    <img src="/modal_1.png" alt="Example" />
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
        <div
          className="modal fade"
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
                <div>
                  <div>MENU : </div>
                  <div>VALUE : AA</div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* END */}

        {/* UPLOAD MODAL */}
        <div
          className="modal fade  uploadmodal"
          id="staticBackdrop2"
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
                  UPLOAD{" "}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div
                  className="upload-block"
                  onDragEnter={handleUploadModalDragEnter}
                  onDragLeave={handleUploadModalDragLeave}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                >
                  +
                </div>
                <div className="preview">
                  {previewImages.length > 0 ? (
                    <div className="preview-container">
                      {previewImages.map((src, index) => (
                        <div
                          key={index}
                          className="preview-image"
                          style={{ position: "relative" }}
                        >
                          <img
                            src={src}
                            alt={`preview-${index}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                          {/* 삭제 버튼 */}
                          <button
                            style={{
                              position: "absolute",
                              top: "0px",
                              right: "20px",
                              backgroundColor: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "25%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            -
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>-</p>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpload} // 업로드 처리
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* END */}
      </div>
    </div>
  );
}

export default App;
