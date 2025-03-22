import React, { useState, useEffect } from "react";

// Modular custom hook, so that initial render gets localStorage data and not null, also taking care of updating localStorage
// use this instead of useState if you want to use localStorage
/**
 *  @param {string} key => localStorage key for accessing the correct localStorage data (needs to be unique)
 *  @param {T} initialValue => THIS NEEDS TO BE A OBJECT TO WORK (currently)
 *  if localStorage is null then return this value
 *  */

// Can return type any as this custom hook will have many diffrent inputs
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Read from localStorage during initial render
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);

      if (storedValue) {
        const parsedValue = JSON.parse(storedValue);

        // If initialValue is an object, merge with parsedValue
        if (typeof initialValue === "object" && initialValue !== null) {
          return { ...initialValue, ...parsedValue };
        } else {
          // For primitive types, return the parsed value directly
          return parsedValue;
        }
      } else {
        // if null
        return initialValue;
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error);
      return initialValue; // Fallback to initialValue if parsing fails
    }
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, 400); // Debounce for 300ms

    return () => clearTimeout(timeoutId); // Cleanup on unmount or re-render
  }, [key, value]);

  return [value, setValue] as const;
}

export default useLocalStorage;
