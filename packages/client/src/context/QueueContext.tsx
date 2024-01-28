import {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
import useSocket from "../hooks/useSocket";
import { useDebounce } from "usehooks-ts";

type QueueItem = { id: string; name: string; inMatch: boolean };

type QueueContextType = {
  queue: QueueItem[];
  challenges: { [matchId: string]: string };
  id?: string;
  name?: string;
  setName: (name: string) => void;
  progress: number;
};

const defaultValues = {
  queue: [],
  challenges: {},
  name: undefined,
  progress: 0,
  setName: () => {}, // IDE doesn't understand this method is actually in use. Don't remove
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
  const [progress, setProgress] = useState<[number, number]>([0, 0]);

  const loadImages = (images: string[]) => {
    images.forEach((image) => {
      const imageElement = new Image();
      imageElement.src = `/images/cards/${image}`;
      imageElement.onload = () => {
        setProgress(([loaded, all]) => [loaded + 1, images.length]);
      };
    });
  };

  const emit = useSocket({
    connected: setId,
    images: loadImages,
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
      console.log("challenge", payload);
      setChallenges((state) => ({
        ...state,
        [payload.matchId]: payload.name,
      }));
    },
    leave: (matchId: string) => {
      console.log("leave", matchId);
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
        progress: progress[1] > 0 ? (progress[1] / progress[0]) * 100 : 0,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export default QueueProvider;
