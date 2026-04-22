import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";
import { findUser } from "@/lib/db";

export const dynamic = "force-dynamic";
let wordCounter = 1;

bot.on("text", async (ctx) => {
  const adminId = ctx.from.id;
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  // Foydalanuvchini ENV yoki List'dan qidiramiz
  const user = findUser(adminId);

  if (!user) {
    return ctx.reply(
      "Siz ro'yxatdan o'tmagansiz! Sayt orqali Admin ID va Channel ID-ni kiriting.",
    );
  }

  const formatted = formatVocabularyMessage(text, wordCounter);
  if (!formatted) return ctx.reply("⚠️ Format xato!");

  try {
    // Topilgan foydalanuvchining kanaliga yuboramiz
    await ctx.telegram.sendMessage(user.channelId, formatted, {
      parse_mode: "HTML",
    });
    await ctx.reply(`✅ #${wordCounter} - so'z muvaffaqiyatli yuborildi!`);
    wordCounter++;
  } catch (e) {
    await ctx.reply("❌ Xato: Bot kanalda admin emas yoki Kanal ID noto'g'ri.");
  }
});

export async function POST(req: Request) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return NextResponse.json({ ok: true });
}
