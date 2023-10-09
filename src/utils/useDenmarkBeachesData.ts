import useSWR, { Fetcher } from "swr";
import { Beaches } from "../../types";

const denmarkBeachesFetcher: Fetcher<Beaches, string> = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

export const useDenmarkBeachesData = () => {
  const { data: beaches = [], ...args } = useSWR<Beaches>(
    "https://api.vandudsigten.dk/beaches",
    denmarkBeachesFetcher
  );

  return { beaches, ...args };
};
