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

export const postJsonResponse = async <ResponseType>(
  url: string,
  data: object,
  headers?: HeadersInit
): Promise<FetchResponse<ResponseType>> => {
  const response = await fetchWithBody(url, data, "POST", headers);
  const responseData = (await response.json()) as ResponseType;
  const responseCode = response.status;

  return {
    data: responseData,
    status: responseCode,
  } as FetchResponse<ResponseType>;
};

const fetchWithBody = async (url: string, data: object, method: string, headers?: HeadersInit) => {
  const response = await fetch(url, {
    method: method,
    headers: { ...headers, "Content-Type": "application/json", Accept: "application/json" },
    cache: "no-store", // TODO consider removing
    body: JSON.stringify(data),
  });
  return response;
};
