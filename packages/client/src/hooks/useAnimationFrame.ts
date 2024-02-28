import { useEffect, useRef } from "react";

const useAnimationFrame = (callback: (frameRate: number) => void) => {
  const prevTimeRef = useRef<number>(0);

  useEffect(() => {
    const animate = (time: number) => {
      const deltaTime = time - prevTimeRef.current;

      callback(deltaTime);

      prevTimeRef.current = time;
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      prevTimeRef.current = 0;
    };
  }, [callback]);
};

export default useAnimationFrame;
