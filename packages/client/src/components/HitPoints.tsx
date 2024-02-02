import React, { FunctionComponent } from "react";

type Props = {
  left: {
    name: string;
    hitPoints: number;
  };
  right: {
    name: string;
    hitPoints: number;
  };
};

const HitPoints: FunctionComponent<Props> = ({ left, right }) => {
  return (
    <section className="flex justify-between my-2 relative w-full h-6">
      <div className="shadow-lg w-1/2 relative">
        <div
          className="h-6 absolute"
          style={{
            background: "red",
            transition: "width 1s",
            width: `${left.hitPoints}%`,
          }}
        />
        <div
          className="h-6 absolute"
          style={{
            background: "green",
            width: `${left.hitPoints}%`,
          }}
        />
        <div className="pl-1 absolute text-sm text-white">{left.name}</div>
      </div>
      <div className="shadow-lg w-1/2 relative">
        <div
          className="h-6 absolute"
          style={{
            background: "red",
            transition: "width 1s",
            width: `${right.hitPoints}%`,
          }}
        />
        <div
          className="h-6 absolute"
          style={{
            background: "green",
            width: `${right.hitPoints}%`,
          }}
        />
        <div className="pr-1 absolute top-0 right-0 text-sm text-white">
          {right.name}
        </div>
      </div>
    </section>
  );
};

export default HitPoints;
