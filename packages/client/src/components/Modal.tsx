import {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useRef,
} from "react";
import { useOnClickOutside } from "usehooks-ts";
import { ModalContext } from "../context/ModalContext";

const Modal: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const { setOpen, open } = useContext(ModalContext);

  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, () => {
    setOpen(false);
  });

  if (!open) {
    return null;
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="w-full h-full absolute top-0 left-0 backdrop-blur-md flex justify-center items-center z-10 p-4">
      <div
        ref={ref}
        className="bg-white w-full max-w-sm h-60 p-2 rounded drop-shadow-xl relative"
      >
        <button className="absolute top-3 right-3" onClick={handleClose}>
          X
        </button>
        <div className="p-2 h-full w-full">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
