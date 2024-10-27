import { useEffect, useRef } from "react";

const useAnimationFrame = (update: (frame: number) => void, cycle = -1) => {
  useEffect(() => {
    let prevTime = 0;
    let deltaTime = 0;
    let timer = 0;
    let animationFrame = 0;
    let frame = 1;

    const animate = (time: number) => {
      deltaTime = time - prevTime;
      timer += deltaTime;

      if (timer >= 1000) {
        update(frame);
        timer = 0;
        frame++;
        if (frame > cycle && cycle !== -1) {
          frame = 1;
        }
      }

      animationFrame = requestAnimationFrame(animate);
      prevTime = time;
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [update]);
};

export default useAnimationFrame;
