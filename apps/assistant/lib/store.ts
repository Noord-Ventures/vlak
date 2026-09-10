import * as files from "./file-store.ts";
import { blobStore } from "./blob-store.ts";

export { checkedId, dataDirectory, MAX_FILE_BYTES, MAX_UPLOAD_BYTES, MAX_UPLOAD_FILES, ownerId, ReferenceAppError, UPLOAD_TYPES, validateUpload } from "./file-store.ts";
export const usesBlobStorage = () => process.env.AI_REFERENCE_STORAGE === "blob";
const backend = () => {
  if (process.env.VERCEL && !usesBlobStorage()) throw new files.ReferenceAppError(503, "Configure durable storage before using the hosted assistant.");
  return usesBlobStorage() ? blobStore : files;
};
export const uploadLimits = () => ({ maxFileBytes: usesBlobStorage() ? 3 * 1024 * 1024 : files.MAX_FILE_BYTES, maxTotalBytes: usesBlobStorage() ? 4 * 1024 * 1024 : files.MAX_UPLOAD_BYTES, maxFiles: files.MAX_UPLOAD_FILES });
export const approvalSecret: typeof files.approvalSecret = (...args) => backend().approvalSecret(...args);
export const listConversations: typeof files.listConversations = (...args) => backend().listConversations(...args);
export const createConversation: typeof files.createConversation = (...args) => backend().createConversation(...args);
export const readConversation: typeof files.readConversation = (...args) => backend().readConversation(...args);
export const saveConversation: typeof files.saveConversation = (...args) => backend().saveConversation(...args);
export const lockConversation: typeof files.lockConversation = (...args) => backend().lockConversation(...args);
export const createTaskOnce: typeof files.createTaskOnce = (...args) => backend().createTaskOnce(...args);
export const snapshotConversation: typeof files.snapshotConversation = (...args) => backend().snapshotConversation(...args);
export const restoreConversation: typeof files.restoreConversation = (...args) => backend().restoreConversation(...args);
export const saveUploads: typeof files.saveUploads = (...args) => backend().saveUploads(...args);
export const readUpload: typeof files.readUpload = (...args) => backend().readUpload(...args);
export const consumeModelBudget = (owner: string) => usesBlobStorage() ? blobStore.consumeModelBudget(owner) : Promise.resolve();
export const requestConversationStop = (owner: string, id: string) => usesBlobStorage() ? blobStore.requestStop(owner, id) : Promise.resolve(false);
export const conversationRunState = (owner: string, id: string) => usesBlobStorage() ? blobStore.runState(owner, id) : Promise.resolve({ running: false, stop: false });
/** Poll the durable lease so a stop handled by another function reaches this worker. */
export function monitorConversationStop(owner: string, id: string, controller: AbortController) {
  if (!usesBlobStorage()) return () => {};
  let stopped = false;
  let timer: ReturnType<typeof setTimeout>;
  const check = async () => {
    if (stopped) return;
    try {
      const state = await conversationRunState(owner, id);
      if (!state.running || state.stop) controller.abort();
    } catch { controller.abort(); }
    if (!stopped && !controller.signal.aborted) timer = setTimeout(() => { void check(); }, 1500);
  };
  timer = setTimeout(() => { void check(); }, 1500);
  return () => { stopped = true; clearTimeout(timer); };
}
