import { useEffect, useState } from "react";

// Delays a rapidly-changing value. Used for search so we fire one request
// after typing stops instead of one per keystroke.
const useDebounce = (value, delay = 350) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cancel if value changes again first
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
