export const getClientCoordinates = <T extends Event>(
  event: T
): [number, number] => {
  if (event instanceof TouchEvent) {
    const touch = event.touches.item(0);
    if (touch) return [touch.clientX, touch.clientY];
  }
  if (event instanceof MouseEvent) {
    return [event.clientX, event.clientY];
  }
  throw new Error("Could not get coordinates");
};
