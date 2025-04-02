import * as Sentry from "@sentry/react";
export const identifySentryUser = (user: { id: number; username: string }) => {
  Sentry.setUser({
    id: user.id,
    username: user.username,
  });
};

export const clearSentryUser = () => {
  Sentry.setUser(null);
};

export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.SeverityLevel
) => {
  Sentry.addBreadcrumb({
    message,
    category: category || "custom",
    level: level || "info", //심각도
    timestamp: Date.now() / 1000,
  });
};

export const captureException = (
  error: Error,
  context?: Record<string, any>
) => {
  Sentry.captureException(error, {
    contexts: context,
  });
};

export const sendUserFeedback = (name: string, message: string) => {
  Sentry.captureFeedback({ name, message });
};

// const transaction = Sentry.startTransaction({
//     name: "transaction-name",
//     operation: "transaction-operation"
//   });
