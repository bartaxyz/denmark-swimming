import { useEffect, useRef, useState } from "react";
import { Beaches } from "../types";

export const useBeachesData = () => {
  const [beaches, setBeaches] = useState<Beaches>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const lastTimeoutDuration = useRef(1000);

  const request = () => {
    setLoading(true);

    fetch("https://api.vandudsigten.dk/beaches")
      .then((response) => response.json())
      .then((data) => setBeaches(data))
      .catch((error) => {
        setError(error);
        console.error(error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    request();
  }, []);

  useEffect(() => {
    if (error && !loading) {
      const timer = setTimeout(() => {
        request();
      }, lastTimeoutDuration.current);

      lastTimeoutDuration.current = lastTimeoutDuration.current * 2;

      return () => clearTimeout(timer);
    }
  }, [error, loading]);

  return { beaches, error, loading };
};
