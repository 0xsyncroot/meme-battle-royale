import { useState, useEffect } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  timeLeft: number;
}

export function useCountdown(targetDate: number): CountdownResult {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const difference = targetDate - now;
      setTimeLeft(Math.max(0, difference));
    };

    updateCountdown(); // Initial calculation
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const days = Math.floor(timeLeft / (24 * 60 * 60));
  const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeLeft % (60 * 60)) / 60);
  const seconds = timeLeft % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: timeLeft === 0,
    timeLeft,
  };
}
