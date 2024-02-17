import React, {
  createContext,
  FunctionComponent,
  PropsWithChildren,
  useState,
} from "react";
import { AttackResult, CardType, Side } from "../types";
import useSocket from "../hooks/useSocket";

type MatchContextType = {
  selectedCards: number[];
  handleSelectCard: (selectedIndex: number) => void;
  handleDeselectCard: (selectedIndex: number) => void;
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
  results: AttackResult[];
};

const defaultValues = {
  isLockedIn: false,
  isPlayed: false,
  selectedCards: [],
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
  results: [],
};

export const MatchContext = createContext<MatchContextType>(defaultValues);

const MatchProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
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
  const [cardsInHand, setCardsInHand] = useState<number[]>([0, 1, 2, 3, 4]);
  const [isPlayed, setIsPlayed] = useState(false);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [results, setResults] = useState<AttackResult[]>([]);

  const resetHand = (cards: CardType[]) => {
    setCardsInHand(
      Array(cards.length)
        .fill(0)
        .map((_, i) => i)
    );
  };

  const emit = useSocket({
    message: (message: string) => console.log("message", message),
    hand: (cards: CardType[]) => {
      console.log("hand", cards);
      setCards(cards);
      resetHand(cards);
    },
    results: (results: AttackResult[]) => {
      console.log("results", results);
      setIsPlayed(true);
      setIsLockedIn(false);
      setSelectedCards([]);
      setResults(results);
    },
    hitPoints: setHitPoints,
    side: (side: Side) => {
      console.log("side", side);
      setSide(side);
    },
    ready: setIsReady,
    leave: () => setIsReady(false),
    opponent: (opponent: any) => {
      console.log("opponent", opponent);
      setOpponent(opponent);
    },
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
        results,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export default MatchProvider;
