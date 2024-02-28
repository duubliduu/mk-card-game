import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import useSocket from "../hooks/useSocket";
import { useDebounce } from "usehooks-ts";
import imageService from "../services/imageService";

type QueueItem = { id: string; name: string; inMatch: boolean };

type QueueContextType = {
  queue: QueueItem[];
  challenges: Record<string, string>;
  setName: (name: string) => void;
  progress: number;
  id?: string;
  name?: string;
};

const defaultValues = {
  queue: [],
  challenges: {},
  progress: 0,
  setName: () => {}, // IDE doesn't understand this method is actually in use. Don't remove
};

export const QueueContext = createContext<QueueContextType>(defaultValues);

const QueueProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [queue, setQueue] = useState<QueueContextType["queue"]>(
    defaultValues.queue
  );
  const [challenges, setChallenges] = useState<QueueContextType["challenges"]>(
    defaultValues.challenges
  );
  const [id, setId] = useState<QueueContextType["id"]>("Demo");
  const [name, setName] = useState<QueueContextType["name"]>();

  const emit = useSocket({
    connected: setId,
    images: (payload) => imageService.loadImages(payload),
    queue: setQueue,
    add: (payload: QueueItem) => {
      setQueue((state) => [...state, payload]);
    },
    remove: (payload: string) => {
      setQueue((state) => state.filter(({ id }) => id !== payload));
    },
    update: (payload: QueueItem) => {
      setQueue((state) =>
        state.map((item) => (item.id === payload.id ? payload : item))
      );
    },
    challenge: (payload: { matchId: string; name: string }) => {
      setChallenges((state) => ({
        ...state,
        [payload.matchId]: payload.name,
      }));
    },
    leave: (matchId: string) => {
      setChallenges((state) => {
        // Remove the challenge from the list
        const { [matchId]: _, ...rest } = state;
        return {
          ...rest,
        };
      });
    },
  });

  const debouncedValue = useDebounce<string | undefined>(name, 500);

  useEffect(() => {
    if (debouncedValue !== undefined) {
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
        progress: 0,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueProvider;
