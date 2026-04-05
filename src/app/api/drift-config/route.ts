import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "drift-config.json");

function readConfig() {
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return { driftMode: false };
  }
}

export async function GET() {
  return NextResponse.json(readConfig());
}

export async function POST(request: Request) {
  const body = await request.json();
  const config = { driftMode: Boolean(body.driftMode) };
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  return NextResponse.json(config);
}
