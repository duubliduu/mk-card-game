import "./Effect.css";
import { FunctionComponent, useEffect, useRef } from "react";

type EffectProps = {
  delay?: number;
  top?: number;
  front?: boolean;
};
const Effect: FunctionComponent<EffectProps> = ({
  delay = 50,
  top = 0,
  front = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.classList.add("animate");
    }, delay);
  }, [ref, delay]);

  return (
    <div
      className={`swing ${front ? "front" : ""}`}
      ref={ref}
      style={{ top: `${top + 15}px` }}
    ></div>
  );
};

export default Effect;
