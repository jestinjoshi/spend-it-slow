import { NextResponse } from "next/server";

// Cache upstream rates for a day; FX moves slowly and this keeps us well within
// any rate limits while the client also persists the last result locally.
const ONE_DAY = 60 * 60 * 24;

export const revalidate = 86400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") ?? "USD").toUpperCase();

  try {
    const upstream = await fetch(`https://api.frankfurter.app/latest?from=${base}`, {
      next: { revalidate: ONE_DAY },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Exchange rates unavailable." }, { status: 502 });
    }
    const data = (await upstream.json()) as {
      base: string;
      date: string;
      rates: Record<string, number>;
    };

    // Reshape to our RateTable contract.
    return NextResponse.json(
      { base: data.base, date: data.date, rates: data.rates },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${ONE_DAY}, stale-while-revalidate=604800`,
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Exchange rates unavailable." }, { status: 502 });
  }
}
