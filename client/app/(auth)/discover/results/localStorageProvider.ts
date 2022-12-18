export default function localStorageProvider() {
  // When initializing, restore the data from localStorage into a map
  const map = new Map<number, boolean>(JSON.parse(localStorage.getItem('lightning-app-selected-types') || '[]'));

  function saveToLocal() {
    const selectedTypes = JSON.stringify(Array.from(map.entries()).filter((value) => {
      if ((value[1] as any).data === true) return true;
      return false;
    }));
    localStorage.setItem('lightning-app-selected-types', selectedTypes);
  }

  // Before unloading the app, we write back all the data into localStorage
  window.addEventListener('beforeunload', saveToLocal);
  // If navigating away from the page, write back all data into localStorage
  window.addEventListener('popstate', saveToLocal);

  // Using map for write & read performance
  return map;
}
