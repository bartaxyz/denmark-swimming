import useSWR, { Fetcher } from "swr";
import { Beaches } from "../../types";

const denmarkBeachesFetcher: Fetcher<Beaches, string> = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

const DENMARK_BEACHES_DATA_ENDPOINT = "https://api.vandudsigten.dk/beaches";

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
