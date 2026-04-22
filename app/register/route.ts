import { NextResponse } from "next/server";
import { registerUser } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { adminId, channelId } = await req.json();

    if (!adminId || !channelId) {
      return NextResponse.json(
        { error: "Ma'lumotlar to'liq emas" },
        { status: 400 },
      );
    }

    registerUser(Number(adminId), channelId);

    return NextResponse.json({ ok: true, message: "Muvaffaqiyatli saqlandi" });
  } catch (error) {
    return NextResponse.json({ error: "Serverda xatolik" }, { status: 500 });
  }
}
