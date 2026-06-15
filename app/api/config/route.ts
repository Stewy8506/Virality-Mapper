import { NextResponse } from "next/server";
import { getServerConfiguredProviders } from "@/lib/api-keys";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    serverConfiguredProviders: getServerConfiguredProviders(),
  });
}
