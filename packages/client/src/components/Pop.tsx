import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { hit, whiff } from "../utils/audio";

type PopProps = PropsWithChildren<{
  sfx?: "hit" | "whiff";
}>;

const Pop: FunctionComponent<PopProps> = ({ children, sfx }) => {
  const [animate, setAnimate] = useState<boolean>(false);

  useEffect(() => {
    if (sfx === "hit") {
      hit.play().catch(console.log);
    } else if (sfx === "whiff") whiff.play().catch(console.log);

    setTimeout(() => {
      setAnimate(true);
    }, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`top-0 absolute transition-opacity ${animate ? "opacity-0" : ""}`}
    >
      {children}
    </div>
  );
};

export default Pop;
