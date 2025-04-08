import { setupWorker } from "msw/browser";
import { boardHandlers } from "./handlers/board";

export const worker = setupWorker(...boardHandlers);
