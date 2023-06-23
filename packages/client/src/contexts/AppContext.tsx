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

export const AppContext = createContext<AppContextProps>({
  id: undefined,
  setId: () => {},
});

const AppContextProvider: FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [id, setId] = useState<string | undefined>();

  return (
    <AppContext.Provider value={{ id, setId }}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
