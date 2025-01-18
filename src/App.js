import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import './App.css';

function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [images, setImages] = useState([]); // State to hold images for the current month
  const calendarRef = useRef(null); // FullCalendar를 제어하기 위한 ref

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    setCurrentDate(newDate);
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    setCurrentDate(newDate);
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  const handleToday = () => {
    const newDate = new Date();
    setCurrentDate(newDate);
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  // Fetch images for the current year and month
  useEffect(() => {
    const fetchImages = async () => {
      const monthString = currentMonth.toString().padStart(2, '0');
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
        console.error('Error fetching images:', error);
        setImages([]);
      }
    };

    fetchImages();
  }, [currentYear, currentMonth]);

  return (
    <div className="App">
      <div className="postcard-container">
        <div className="controller">
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <div className="photo-frame">
          {images.length > 0 ? (
            <Swiper
              spaceBetween={10}
              slidesPerView={1}
              effect="fade"
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
          )}
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="nav-button"><span className="material-symbols-outlined">arrow_left</span></button>
            <h2>{currentYear}년 {currentMonth}월</h2>
            <button onClick={handleNextMonth} className="nav-button"><span className="material-symbols-outlined">arrow_right</span></button>
            <button onClick={handleToday} className="today-button">오늘</button>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            events={[]}
            initialDate={currentDate.toISOString().split('T')[0]}
            datesSet={(dateInfo) => {
              const newDate = new Date(dateInfo.startStr);
              setCurrentDate(newDate);
            }}
          />
        </div>

        {/* Modal */}
        <div
          className="modal fade"
          id="staticBackdrop"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
          tabIndex="-1"
          aria-labelledby="staticBackdropLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="staticBackdropLabel">Settings</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                Settings content goes here.
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
      </div>
    </div>
  );
}

export default App;
