import { FunctionComponent, useState } from "react";
import useAnimationFrame from "../hooks/useAnimationFrame";

const Timer: FunctionComponent = () => {
  const [timer, setTimer] = useState(0);

  useAnimationFrame((deltaTime: number) => {
    setTimer((state) => (state + deltaTime * 0.01) % 100);
  });

  return <div>{timer}</div>;
};

export default Timer;
