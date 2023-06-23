import { FunctionComponent, useContext, useState } from "react";
import useSocket from "./hooks/useSocket";
import { AppContext } from "./contexts/AppContext";
import { useNavigate } from "react-router-dom";

const Queue: FunctionComponent<{}> = () => {
  const [queue, setQueue] = useState<string[]>([]);
  const { id, setId } = useContext(AppContext);
  const [challenges, setChallenge] = useState<string[]>([]);

  const navigate = useNavigate();

  const socketRef = useSocket({
    id: setId,
    queue: setQueue,
    challenge: (matchId: string) => {
      setChallenge((state) => [...state, matchId]);
    },
    startMatch: (matchId: string) => {
      navigate(`/match/${matchId}`);
    },
  });

  const handleChallenge = (id: string) => {
    socketRef.current?.emit("challenge", id);
  };

  return (
    <div className="container px-4 py-4">
      <div>My ID {id}</div>
      <section>
        <div>
          {challenges.map((matchId, index) => (
            <div className="flex justify-between" key={index}>
              <div>Challenge!</div>
              <div>
                <a href={`/match/${matchId}`}>Accept</a>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div>ID</div>
            <div>Action</div>
          </div>
          {queue.map((item, index) => (
            <div className="flex justify-between" key={index}>
              <div className={`${item === id ? "font-bold" : ""}`}>{item} </div>
              <div>
                {item !== id && (
                  <button onClick={() => handleChallenge(item)}>
                    Challenge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Queue;
