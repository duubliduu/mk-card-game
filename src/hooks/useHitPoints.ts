import { useState } from "react";

const useHitPoints = (
  defaultHitPoints = 100
): [number, (damage: number) => void] => {
  const [hitPoints, setHitPoints] = useState(defaultHitPoints);

  const takeDamage = (damage: number) => {
    setHitPoints((state) => state - damage);
  };

  return [hitPoints, takeDamage];
};

export default useHitPoints;
