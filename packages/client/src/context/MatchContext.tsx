import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from "react";
import { CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";

type MatchContextType = {
  selectedCards: number[];
  handleSelectCard: (selectedIndex: number) => void;
  handleDeselectCard: (selectedIndex: number) => void;
  table: Record<Side, CardType | null>;
  cards: CardType[];
  hitPoints: { [side in Side]: number };
  side: Side;
  pops:
    | { damage: { [Side.Left]: number; [Side.Right]: number }; message: string }
    | undefined;
  handlePlay: () => void;
  handleExit: () => void;
  opponent: Partial<{ id: string; name: string; side: Side }>;
  isLockedIn: boolean;
  isPlayed: boolean;
  isReady: boolean;
  handleJoinMatch: (matchId: string) => void;
  cardsInHand: number[];
};

const defaultValues = {
  isLockedIn: false,
  isPlayed: false,
  selectedCards: [],
  table: { [Side.Left]: null, [Side.Right]: null },
  setTable: () => {}, // IDE doesn't understand this method is actually in use. Don't remove
  cards: [],
  hitPoints: { [Side.Left]: 100, [Side.Right]: 100 },
  side: Side.Left,
  pops: { damage: { [Side.Left]: 0, [Side.Right]: 0 }, message: "" },
  handleExit: () => {},
  opponent: {},
  isReady: false,
  cardsInHand: [],
  handleSelectCard: () => {},
  handleDeselectCard: () => {},
  handlePlay: () => {},
  handleJoinMatch: () => {},
};

export const MatchContext = createContext<MatchContextType>(defaultValues);

const MatchProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [table, setTable] = useState<{ [side in Side]: CardType | null }>({
    [Side.Left]: null,
    [Side.Right]: null,
  });
  const [cards, setCards] = useState<CardType[]>([]);
  const [hitPoints, setHitPoints] = useState<{ [side in Side]: number }>({
    [Side.Left]: 100,
    [Side.Right]: 100,
  });
  const [side, setSide] = useState<Side>(Side.Left);
  const [pops, setPops] = useState<{
    damage: { [Side.Left]: number; [Side.Right]: number };
    message: string;
  }>();
  const [isReady, setIsReady] = useState<boolean>(true);
  const [opponent, setOpponent] = useState<
    Partial<{ id: string; name: string }>
  >({});
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [cardsInHand, setCardsInHand] = useState<number[]>([]);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isLockedIn, setIsLockedIn] = useState(false);

  const emit = useSocket({
    message: (message: string) => console.log("message", message),
    hand: (payload: CardType[]) => {
      console.log("hand", payload);
      setCards([...payload]);
      setSelectedCards([]);
      setCardsInHand(
        Array(payload.length)
          .fill(0)
          .map((_, i) => i)
      );
    },
    table: (payload: any) => {
      console.log("table", payload);
      setIsPlayed(false);
      setTable(payload);
    },
    play: (payload: any) => {
      console.log("play", payload);
      setIsPlayed(true);
      setIsLockedIn(false);
      setSelectedCards([]);
      setTable(payload);
    },
    hitPoints: setHitPoints,
    pop: setPops,
    side: setSide,
    ready: setIsReady,
    leave: () => setIsReady(false),
    opponent: setOpponent,
    exit: () => {
      //navigate("/");
    },
    disconnect: () => {
      //navigate("/");
    },
    gameOver: (gameState?: "win" | "lose") => {
      if (gameState === "lose") {
        console.log("Lose");
      } else if (gameState === "win") {
        console.log("Win");
      }
    },
  });

  const handleSelectCard = (index: number) => {
    setSelectedCards((state) =>
      state.includes(index) ? state : [...state, index]
    );
    setCardsInHand((state) => state.filter((i) => i !== index));
  };

  const handleDeselectCard = (index: number) => {
    setSelectedCards((state) => state.filter((i) => i !== index));
    setCardsInHand((state) =>
      state.includes(index) ? state : [...state, index]
    );
  };

  const handlePlay = () => {
    setIsLockedIn(true);
    emit("play", selectedCards);
  };

  const handleExit = () => {
    emit("leaveMatch");
    //navigate("/");
  };

  const handleJoinMatch = (matchId: string) => {
    emit("joinMatch", matchId);
  };

  return (
    <MatchContext.Provider
      value={{
        selectedCards,
        handleSelectCard,
        handleDeselectCard,
        hitPoints,
        table,
        cards,
        side,
        pops,
        handlePlay,
        handleExit,
        opponent: {
          id: opponent.id,
          name: opponent.name,
          side: Number(!side) as Side,
        },
        isReady,
        isLockedIn,
        isPlayed,
        handleJoinMatch,
        cardsInHand,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export default MatchProvider;
