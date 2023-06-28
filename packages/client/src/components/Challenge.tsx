import React, { FunctionComponent } from "react";

type ChallengeProps = {
  name: string;
  onAccept: () => void;
};

const Challenge: FunctionComponent<ChallengeProps> = ({ name, onAccept }) => {
  return (
    <div className="flex justify-between items-center rounded p-2 mb-1 text-xls border-dashed border-2 border-red-700">
      <span className="text-red-700 font-bold">
        <pre>{name}</pre>
      </span>
      <button
        onClick={onAccept}
        className="bg-red-700 rounded font-bold text-white p-2"
      >
        Join
      </button>
    </div>
  );
};

export default Challenge;
