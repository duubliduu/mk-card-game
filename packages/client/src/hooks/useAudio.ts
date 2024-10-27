import { useEffect, useState } from "react";

const useAudio = (sound: string): [() => void, boolean] => {
  const [isPlaying, setIsPlaying] = useState(false);

  // @ts-ignore
  const audio = new Audio(sound);

  const play = () => {
    audio.play().catch(console.error);
  };

  useEffect(() => {
    function handleEnded() {
      setIsPlaying(false);
    }
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [play, isPlaying];
};

export default useAudio;
