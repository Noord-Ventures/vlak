import { conversationGet } from "../../../../lib/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { return conversationGet(request, (await context.params).id); }
