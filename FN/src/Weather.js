import React, { useState, useEffect } from "react";

const Weather = () => {
  const [currentTime, setCurrentTime] = useState(""); // 현재 시간
  const [currentDay, setCurrentDay] = useState(""); // 현재 요일과 날짜

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

      // 시간 포맷 (AM/PM 포함)
      const formattedTime = `${hours >= 12 ? "PM" : "AM"} ${String(
        hours % 12 || 12
      ).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
      setCurrentTime(formattedTime);

      // 요일과 날짜 포맷
      const formattedDay = `${weekDays[now.getDay()]} ${now.getDate()}일`;
      setCurrentDay(formattedDay);
    };

    // 초기 업데이트 및 매 초 업데이트
    updateTime();
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);

  return (
    <div className="weather-block" >
      <div className="items">
          <div className="item"></div>
          <div className="item"></div>
          <div className="item"></div>
          <div className="item"></div>
      </div>
    </div>
  );
};

export default Weather;
