import React, {
  ChangeEventHandler,
  FunctionComponent,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { QueueContext } from "./context/QueueContext";
import useSocket from "./hooks/useSocket";
import Challenge from "./components/Challenge";

const Queue: FunctionComponent = () => {
  const { id, queue, challenges, name, setName } = useContext(QueueContext);

  const emit = useSocket({
    startMatch: (matchId: string) => {
      navigate(`/match/${matchId}`);
    },
  });

  const navigate = useNavigate();

  const handleChallenge = (id: string) => {
    emit("challenge", id);
  };

  const handleAccept = (matchId: string) => {
    navigate(`/match/${matchId}`);
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

  const handleChangeName: ChangeEventHandler<HTMLInputElement> = (event) => {
    setName(event.target.value);
  };

  return (
    <div className="container px-4 py-4 max-w-content">
      <header className="pb-2">
        <h1 className="font-bold text-2xl pb-2 text-red-700">
          Combat Cards POC
        </h1>
        <div className="h-16 w-full">
          <label className="relative flex flex-col">
            <span className="abolute text-xs p-2">Change name</span>
            <input
              onChange={handleChangeName}
              className="absolute bg-transparent border-2 rounded p-2 pt-6 w-full"
              type="text"
              value={name}
              maxLength={20}
            />
          </label>
        </div>
      </header>
      <section>
        <div>
          <Challenge
            by={"Practice against the AI"}
            onAccept={() => handleAccept("AI")}
          />
          {Object.entries(challenges).map(([key, { by, matchId }]) => (
            <Challenge
              key={key}
              by={by}
              onAccept={() => handleAccept(matchId)}
            />
          ))}
        </div>
      </section>
      <section className="py-2">
        <button
          onClick={handleShare}
          className="rounded bg-red-700 px-1 py-2 text-white w-full font-bold"
        >
          INVITE someone!
        </button>
      </section>
      <section>
        <div className="flex flex-col">
          <div className="flex justify-between font-bold pb-1 mb-1 border-b-2 border-slate-200">
            <div>Players in the queue</div>
          </div>
          {!queue.length && (
            <div className="italic py-4">
              <p className="mb-4">There's no one in the queue :(</p>
            </div>
          )}
          {queue.map(([itemId, itemName]) => (
            <div
              className="flex justify-between items-center pb-1 mb-1 border-dashed border-b-2 border-inherit"
              key={itemId}
            >
              <div className={`${itemId === id ? "italic" : ""}`}>
                <pre className="text-sm">
                  [{itemId}] {itemName || <em>Ano</em>}
                </pre>
              </div>
              <div>
                {itemId === id ? (
                  <button
                    disabled
                    className="rounded bg-slate-400 p-2 text-white text-sm font-bold"
                  >
                    Challenge
                  </button>
                ) : (
                  <button
                    className="rounded bg-red-700 p-2 text-white text-sm font-bold"
                    onClick={() => handleChallenge(itemId)}
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
