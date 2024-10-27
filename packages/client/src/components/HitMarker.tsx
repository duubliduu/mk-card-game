import { FunctionComponent, useEffect, useRef } from "react";
import useAudio from "../hooks/useAudio";

type HitMarkerProps = {
  delay?: number;
  top?: number;
  sound?: string;
  right?: boolean;
  left?: boolean;
};

const HitMarker: FunctionComponent<HitMarkerProps> = ({
  delay = 50,
  top = 0,
  sound = "hit",
  right = false,
  left = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [playHitSound] = useAudio("/audio/hit.wav");

  useEffect(() => {
    setTimeout(() => {
      // playHitSound();
      ref.current?.classList.add("animate");
    }, delay);
  }, [ref, delay]);

  return (
    <div
      className={`hit-marker ${left ? "left" : ""} ${right ? "right" : ""}`}
      ref={ref}
      style={{ top: `${top}px` }}
    ></div>
  );
};

export default HitMarker;
