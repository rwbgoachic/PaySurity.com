/**
 * A custom hook to parse and return URL query parameters
 * @template T The type of the parameters object to return
 * @returns An object containing the parsed query parameters
 */
export function useQueryParams<T>(): T {
  if (typeof window === 'undefined') {
    return {} as T;
  }
  
  const searchParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params as T;
}