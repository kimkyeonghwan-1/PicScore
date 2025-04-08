import { createRoot } from "react-dom/client";
import React from "react";
import {
  RouterProvider,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import router from "./router/router.tsx";
import "./index.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import * as Sentry from "@sentry/react";
import ErrorPage from "./page/Error/ErrorPage.tsx";
import { captureException } from "./utils/sentry.ts";
import "./mocks/mockSetup";
import { queryClient } from "./lib/queryClient.ts";
import { initSentry } from "./lib/sentry.ts";

initSentry();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorPage}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
