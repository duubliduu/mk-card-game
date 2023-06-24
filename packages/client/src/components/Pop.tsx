import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import { punch } from "../utils/audio";

const Pop: FunctionComponent<PropsWithChildren<{}>> = ({ children }) => {
  const [animate, setAnimate] = useState<boolean>(false);

  useEffect(() => {
    punch.play().catch(console.log);
    setTimeout(() => {
      setAnimate(true);
    }, 250);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`absolute transition-opacity ${animate ? "opacity-0" : ""}`}
    >
      {children}
    </div>
  );
};

export default Pop;
