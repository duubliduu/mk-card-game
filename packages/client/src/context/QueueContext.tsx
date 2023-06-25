import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import useSocket from "../hooks/useSocket";
import { useDebounce } from "usehooks-ts";

type QueueContextType = {
  queue: [string, string][];
  challenges: { [key: string]: { by: string; matchId: string } };
  id?: string;
  name?: string;
  setName: (name: string) => void;
};

const defaultValues = {
  queue: [],
  challenges: {},
  name: undefined,
  setName: () => {},
};
export const QueueContext = createContext<QueueContextType>(defaultValues);

const QueueProvider: FunctionComponent<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [id, setId] = useState<QueueContextType["id"]>();
  const [queue, setQueue] = useState<QueueContextType["queue"]>(
    defaultValues.queue
  );
  const [challenges, setChallenges] = useState<QueueContextType["challenges"]>(
    defaultValues.challenges
  );
  const [name, setName] = useState<QueueContextType["name"]>(
    defaultValues.name
  );

  const emit = useSocket({
    id: setId,
    queue: setQueue,
    challenges: setChallenges,
  });

  const debouncedValue = useDebounce<string | undefined>(name, 1000);

  useEffect(() => {
    if (debouncedValue !== undefined) {
      console.log("debounced", debouncedValue);
      emit("name", debouncedValue);
    }
  }, [emit, debouncedValue]);

  return (
    <QueueContext.Provider
      value={{
        id,
        queue,
        challenges,
        name,
        setName,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueProvider;
