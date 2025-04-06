import { captureException } from "../utils/sentry";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 에러가 이미 처리되었는지 확인
      if (query.meta?.skipErrorLogging) {
        return;
      }

      captureException(error as Error, {
        source: "react-query",
        type: "query-error",
        queryKey: query.queryKey,
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // 에러가 이미 처리되었는지 확인
      if (mutation.meta?.skipErrorLogging) {
        return;
      }

      captureException(error as Error, {
        source: "react-query",
        type: "mutation-error",
        mutationId: mutation.mutationId,
      });
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});
