import axios, { type AxiosResponse } from "axios";

export type ResponseError = Error & { response?: AxiosResponse };

export type RequestFailEvent = CustomEvent<{ status: number; message: string }>;

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

http.interceptors.request.use((request) => {
  if (request.headers && request.url?.startsWith("/api/")) {
    const token = localStorage.getItem("token");
    if (token) request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

http.interceptors.response.use(undefined, (error: ResponseError) => {
  const response = error.response;
  const status: number = response?.status ?? 0;
  const message: string = response?.data?.message || "";

  window.dispatchEvent(
    new CustomEvent("request-fail", { detail: { status, message } })
  );

  return Promise.reject(error);
});
