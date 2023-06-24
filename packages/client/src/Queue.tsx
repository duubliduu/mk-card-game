import { FunctionComponent, useState } from "react";
import useSocket from "./hooks/useSocket";
import { useNavigate } from "react-router-dom";

const Queue: FunctionComponent<{}> = () => {
  const [queue, setQueue] = useState<string[]>([]);
  const [id, setId] = useState<string>("");
  const [challenges, setChallenge] = useState<string[]>([]);

  const navigate = useNavigate();

  const socketRef = useSocket({
    id: setId,
    queue: setQueue,
    challenge: (matchId: string) => {
      setChallenge((state) => [...state, matchId]);
    },
    startMatch: (matchId: string) => {
      socketRef.current?.disconnect();
      navigate(`/match/${matchId}`);
    },
  });

  const handleChallenge = (id: string) => {
    socketRef.current?.emit("challenge", id);
  };

  const handleShare = () => {
    if (typeof navigator.share !== "function") {
      return; // The share method works only with SSL
    }
    return navigator.share({
      url: window.location.href,
      text: "Come check out this awesome FIGHTING-CARD-GAME!",
      title: "INVITATION | Combat Cards",
    });
  };

  return (
    <div className="container px-4 py-4 max-w-content">
      <header className="text-2xl pb-4">
        <h1>Combat Cards POC</h1>
      </header>
      <section>
        <div className="pb-4">
          {challenges.map((matchId, index) => (
            <div
              className="flex justify-between items-center rounded p-2 mb-1 text-xls border-dashed border-2 border-red-700"
              key={index}
            >
              <span className="text-red-700 font-bold">
                You have a CHALLENGE!
              </span>
              <a
                href={`/match/${matchId}`}
                className="bg-red-700 rounded font-bold text-white p-2"
              >
                FIGHT!
              </a>
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="flex flex-col">
          <div className="flex justify-between font-bold pb-1 mb-1 border-b-2 border-slate-200">
            <div>Players in the queue</div>
          </div>
          {!queue.length && (
            <div className="italic py-4">
              <p className="mb-4">There's no one in the queue :(</p>
              <button
                onClick={handleShare}
                className="rounded bg-red-700 px-1 py-2 text-white w-full font-bold"
              >
                INVITE someone!
              </button>
            </div>
          )}
          {queue.map((item, index) => (
            <div
              className="flex justify-between items-center pb-1 mb-1 border-dashed border-b-2 border-inherit"
              key={item}
            >
              <div className={`${item === id ? "italic" : ""}`}>
                {item === id ? "You" : "Someone else"}
              </div>
              <div>
                {item === id ? (
                  <button
                    disabled
                    className="rounded bg-slate-400 p-2 text-white text-sm font-bold"
                  >
                    Challenge
                  </button>
                ) : (
                  <button
                    className="rounded bg-red-700 p-2 text-white text-sm font-bold"
                    onClick={() => handleChallenge(item)}
                  >
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
