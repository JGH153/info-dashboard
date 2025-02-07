type FetchResponse<ResponseType> = {
  status: number;
  data: ResponseType;
};

export const getAsJson = async <ResponseType>(
  url: string,
  headers?: HeadersInit
): Promise<FetchResponse<ResponseType>> => {
  const response = await fetch(url, {
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    cache: "no-store", // needed?
  });

  const responseData = (await response.json()) as ResponseType;
  const responseCode = response.status;

  return {
    data: responseData,
    status: responseCode,
  } as FetchResponse<ResponseType>;
};
