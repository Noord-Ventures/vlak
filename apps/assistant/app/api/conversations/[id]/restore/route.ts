import { conversationRestore } from "../../../../../lib/server";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) { return conversationRestore(request, (await context.params).id); }
