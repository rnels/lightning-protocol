import { ContractType } from "../../../../lib/types";

export default function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map<number, ContractType>(JSON.parse(localStorage.getItem('lightning-app-selected-types') || '[]'))

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    const selectedTypes = JSON.stringify(Array.from(map.entries()).filter((value) => {
      if ((value[1] as any).data) return true;
      return false;
    }));
    localStorage.setItem('lightning-app-selected-types', selectedTypes);
  });

  // We still use the map for write & read for performance.
  return map;
}
