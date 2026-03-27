import { NextResponse } from "next/server";

type HealthcheckRow = {
  key: "healthcheck";
  value: {
    ping: string;
    checkedAt: string;
  };
  updated_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function GET() {
  const checkedAt = new Date().toISOString();

  if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
    return NextResponse.json({
      checkedAt,
      enabled: false,
      ok: false,
      message: "Supabase 환경변수가 아직 연결되지 않았습니다",
    });
  }

  try {
    const writeResponse = await fetch(`${SUPABASE_URL}/rest/v1/app_state?on_conflict=key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_PUBLIC_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        {
          key: "healthcheck",
          value: {
            ping: "slingshot-healthcheck",
            checkedAt,
          },
          updated_at: checkedAt,
        },
      ]),
      cache: "no-store",
    });

    if (!writeResponse.ok) {
      return NextResponse.json({
        checkedAt,
        enabled: true,
        ok: false,
        message: `쓰기 실패: ${writeResponse.status}`,
      });
    }

    const readResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/app_state?key=eq.healthcheck&select=key,value,updated_at`,
      {
        headers: {
          apikey: SUPABASE_PUBLIC_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
        },
        cache: "no-store",
      }
    );

    if (!readResponse.ok) {
      return NextResponse.json({
        checkedAt,
        enabled: true,
        ok: false,
        message: `읽기 실패: ${readResponse.status}`,
      });
    }

    const rows = (await readResponse.json()) as HealthcheckRow[];
    const row = rows[0];
    const ok = row?.value?.checkedAt === checkedAt;

    return NextResponse.json({
      checkedAt,
      enabled: true,
      ok,
      message: ok
        ? "Supabase 읽기/쓰기가 정상 동작 중입니다"
        : "DB 응답은 왔지만 최신 점검값과 일치하지 않습니다",
    });
  } catch (error) {
    return NextResponse.json({
      checkedAt,
      enabled: true,
      ok: false,
      message: error instanceof Error ? error.message : "Supabase 연결 점검에 실패했습니다",
    });
  }
}
