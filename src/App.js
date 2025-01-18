import { useState } from 'react';
import './App.css';

function App() {
  // 현재 날짜로 초기화
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // getMonth()는 0-11을 반환하므로 1을 더함
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 1) {
        setCurrentYear(year => year - 1);
        return 12;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 12) {
        setCurrentYear(year => year + 1);
        return 1;
      }
      return prev + 1;
    });
  };

  // 해당 월의 첫 날짜의 요일 구하기 (0: 일요일, 1: 월요일, ...)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // 해당 월의 마지막 날짜 구하기
  const getLastDayOfMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  // 달력 그리드 생성
  const generateCalendarGrid = () => {
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const lastDay = getLastDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // 이전 달의 마지막 날짜들
    const prevMonthLastDay = getLastDayOfMonth(currentYear, currentMonth - 1);
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`prev-${i}`} className="calendar-day prev-month">
          {prevMonthLastDay - firstDay + i + 1}
        </div>
      );
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay; i++) {
      const isToday = 
        today.getDate() === i && 
        today.getMonth() === currentMonth - 1 && 
        today.getFullYear() === currentYear;
        
      days.push(
        <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
          {i}
        </div>
      );
    }
    
    // 다음 달의 시작 날짜들
    const remainingDays = 42 - days.length; // 6주 달력을 위해 42칸 맞추기
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day next-month">
          {i}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="App">
      <div className="postcard-container">
        {/* 상단 사진틀 영역 */}
        <div className="photo-frame">
          <img 
            src={`/images/${currentMonth}.png`}
            alt={`${currentMonth}월 사진`}
            className="month-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default.png';
              e.target.className = 'month-image default-image';
            }}
          />
        </div>
        
        {/* 하단 달력 영역 */}
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="nav-button">이전</button>
            <h2>{currentYear}년 {currentMonth}월</h2>
            <button onClick={handleNextMonth} className="nav-button">다음</button>
          </div>
          <div className="calendar-weekdays">
            <div className="sunday">일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div className="saturday">토</div>
          </div>
          <div className="calendar-grid">
            {generateCalendarGrid()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
