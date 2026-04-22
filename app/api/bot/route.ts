import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";

export const dynamic = "force-dynamic";

bot.on("text", async (ctx) => {
  // 1. Env ma'lumotlarini tekshirish
  const CHANNEL_ID = process.env.CHANNEL_ID;
  const ADMIN_ID = Number(process.env.ADMIN_ID);

  // Xavfsizlik filtri
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply(`Sizda ruxsat yo'q. ❌\nSizning ID: ${ctx.from.id}`);
  }

  const text = ctx.message.text;

  // Buyruqlar handlerlari
  if (text === "/start" || text === "/newword" || text === "/help") {
    return ctx.reply(
      "Yangi so'zni quyidagi tartibda yuboring:\n\n" +
        "Word | Definition | Example | Uzbek Note",
      { parse_mode: "Markdown" },
    );
  }

  const formattedText = formatVocabularyMessage(text);

  if (!formattedText) {
    return ctx.reply(
      "⚠️ Format xato! So'zlarni '|' belgisi bilan ajratib yuboring.",
    );
  }

  try {
    // 2. CHANNEL_ID ni tozalash (Agar env da qo'shtirnoq bilan yozilgan bo'lsa)
    const cleanChannelId = String(CHANNEL_ID).replace(/['"]/g, "");

    // 3. Kanalga yuborish
    await ctx.telegram.sendMessage(cleanChannelId, formattedText, {
      parse_mode: "Markdown",
    });

    await ctx.reply("✅ Kanalga yuborildi!");
  } catch (error: any) {
    // 4. Haqiqiy xatoni ko'rsatish (Debug uchun juda muhim!)
    console.error("Telegram xatosi:", error);

    let errorMsg = "Noma'lum xatolik";
    if (error.response) {
      errorMsg = `Kod: ${error.response.error_code} - ${error.response.description}`;
    }

    await ctx.reply(
      `❌ Telegram xatosi:\n${errorMsg}\n\nCHANNEL_ID: ${CHANNEL_ID}`,
    );
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Update error" }, { status: 500 });
  }
}
