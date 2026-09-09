import { conversationsGet, conversationsPost } from "../../../lib/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const GET = conversationsGet;
export const POST = conversationsPost;
