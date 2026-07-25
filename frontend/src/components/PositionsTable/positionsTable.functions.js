import { useState } from "react";

export function usePositionsTable() {
  const [selected, setSelected] = useState(null);
  return {
    selected,
    select: setSelected,
    clear: () => setSelected(null),
  };
}
