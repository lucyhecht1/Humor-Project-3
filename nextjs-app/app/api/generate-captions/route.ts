import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/route";
import { generateCaptions, extractCaptionText } from "@/lib/api/runPipeline";

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseRouteClient(req, res);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let imageId: string;
  let humorFlavorId: number;

  try {
    const body = await req.json();
    imageId = body.imageId;
    humorFlavorId = body.humorFlavorId;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!imageId || !humorFlavorId) {
    return NextResponse.json(
      { error: "imageId and humorFlavorId are required" },
      { status: 400 }
    );
  }

  try {
    const raw = await generateCaptions(imageId, humorFlavorId, session.access_token);
    const captions = raw.map(extractCaptionText).filter((t): t is string => t !== null);

    const response = NextResponse.json({ captions, raw });
    // Forward any cookie updates from the route client
    res.cookies.getAll().forEach(({ name, value, ...options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate captions" },
      { status: 500 }
    );
  }
}
