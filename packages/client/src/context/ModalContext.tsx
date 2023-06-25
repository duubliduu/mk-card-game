import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useState,
} from "react";
import Modal from "../components/Modal";

type ModalContextType = {
  content: ReactNode;
  open: boolean;
  setContent: (content: ReactNode) => void;
  setOpen: (isOpen: boolean) => void;
};

export const ModalContext = createContext<ModalContextType>({
  content: null,
  open: false,
  setContent: () => {},
  setOpen: () => {},
});

const ModalProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [content, setContent] = useState<ReactNode>(null);
  const [open, setOpen] = useState<boolean>(false);

  return (
    <ModalContext.Provider value={{ content, open, setContent, setOpen }}>
      <Modal>{content}</Modal>
      {children}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
