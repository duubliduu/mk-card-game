import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from "react";

type AppContextProps = {
  id: string | undefined;
  setId: (id: string) => void;
};

export const User = createContext<AppContextProps>({
  id: undefined,
  setId: () => {},
});

const AppContextProvider: FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [id, setId] = useState<string | undefined>();

  return <User.Provider value={{ id, setId }}>{children}</User.Provider>;
};

export default AppContextProvider;
