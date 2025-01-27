import React, { useState, useEffect } from "react";

const Timer = () => {
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
    <div className="timer-block">
      <div className="cal-icon">
        <img
          src={`${process.env.PUBLIC_URL}/images/calendar.png`}
          alt="Calendar Icon"
        />
        <span className="week">{currentDay.split(" ")[0] || "요일"}</span>
        <span className="day">{currentDay.split(" ")[1] || "날짜"}</span>
      </div>
      <div className="timer">
        <span>{currentTime.split(" ")[0] || "AM/PM"} </span>
        <span>{currentTime.split(" ")[1]?.split(":")[0] || "00"}</span>
        <span className="double-dot"> : </span>
        <span>{currentTime.split(" ")[1]?.split(":")[1] || "00"}</span>
        <span className="double-dot seconds"> : </span>
        <span className="seconds">{currentTime.split(" ")[1]?.split(":")[2] || "00"}</span>
      </div>
    </div>
  );
};

export default Timer;
