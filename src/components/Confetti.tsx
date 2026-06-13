import { useEffect } from "react";
import confetti from "canvas-confetti";

export const useConfetti = () => {
  return () => {
    const colors = ["#FFB6C1", "#FFDAB9", "#E6E6FA", "#B5EAD7", "#FFF5BA", "#C7CEEA"];
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.4 },
      colors,
      scalar: 0.9,
      ticks: 200,
    });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.5 }, colors });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.5 }, colors });
    }, 200);
  };
};

export const ConfettiOnMount = () => {
  const fire = useConfetti();
  useEffect(() => {
    const t = setTimeout(fire, 400);
    return () => clearTimeout(t);
  }, []);
  return null;
};
