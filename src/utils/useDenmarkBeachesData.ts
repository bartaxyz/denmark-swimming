import useSWR, { Fetcher } from "swr";
import { Beaches } from "../../types";

const DENMARK_BEACHES_DATA_ENDPOINT =
  "https://storage.googleapis.com/beach-data/data.json"; // "https://api.vandudsigten.dk/beaches";

const denmarkBeachesFetcher: Fetcher<Beaches, string> = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

export const useDenmarkBeachesData = () => {
  const {
    data: beaches = [],
    mutate,
    ...args
  } = useSWR<Beaches>(DENMARK_BEACHES_DATA_ENDPOINT, denmarkBeachesFetcher);

  return {
    beaches,
    retry: () => mutate(undefined),
    mutate,
    ...args,
  };
};
