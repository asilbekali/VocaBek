import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";

const CHANNEL_ID = process.env.CHANNEL_ID as string;
const ADMIN_ID = Number(process.env.ADMIN_ID); // Xavfsizlik uchun faqat sizning ID

bot.on("text", async (ctx) => {
  // 1. Faqat siz (admin) yozganingizni tekshiradi
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("Sizda ruxsat yo'q. ❌");
  }

  const text = ctx.message.text;

  // 2. Buyruqlarni tekshirish
  if (text === "/start" || text === "/newword") {
    return ctx.reply(
      "Yangi so'zni quyidagi tartibda yuboring:\n\n" +
        "Word | Definition | Example | Uzbek Note",
    );
  }

  // 3. Formatlash (Middleware qismi)
  const formattedText = formatVocabularyMessage(text);

  if (!formattedText) {
    return ctx.reply(
      "⚠️ Format xato! So'zlarni '|' belgisi bilan ajratib yuboring.",
    );
  }

  try {
    // 4. Kanalga yo'naltirish
    await ctx.telegram.sendMessage(CHANNEL_ID, formattedText, {
      parse_mode: "Markdown",
    });
    await ctx.reply("✅ Kanalga yuborildi!");
  } catch (error) {
    console.error("Xatolik:", error);
    await ctx.reply(
      "❌ Xatolik yuz berdi. Bot kanalda admin ekanini tekshiring.",
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
