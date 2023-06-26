import { useEffect, useRef } from "react";

const useAnimationFrame = (callback: Function) => {
  const requestRef = useRef<number>();
  const previousTimerRef = useRef<number>();

  const animate = (time: number) => {
    if (previousTimerRef.current !== undefined) {
      const deltatime = time - previousTimerRef.current;
      callback(deltatime);
    }
    previousTimerRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useAnimationFrame;
