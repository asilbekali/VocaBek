import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";

export const dynamic = "force-dynamic";

const ADMIN_ID = Number(process.env.ADMIN_ID);
const CHANNEL_ID = process.env.CHANNEL_ID as string;

// Vaqtinchalik counter (Vercel uxlasa reset bo'ladi)
let wordCounter = 1;

// /start buyrug'i
bot.command("start", async (ctx) => {
  await ctx.reply(
    "<b>Assalomu alaykum, Asilbek!</b>\n\n" +
      "So'zlarni quyidagi tartibda (har birini yangi qatordan) yuboring:\n\n" +
      "<code>Word\nDefinition\nExample\nUzbek Note</code>",
    { parse_mode: "HTML" },
  );
});

// /setcounter buyrug'i (Agarda counter adashib ketsa, o'zingiz to'g'irlab qo'yishingiz uchun)
bot.command("set", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const num = parseInt(ctx.message.text.split(" ")[1]);
  if (!isNaN(num)) {
    wordCounter = num;
    await ctx.reply(`✅ Counter ${num} ga o'zgartirildi.`);
  }
});

// Asosiy Middleware
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply(`Ruxsat yo'q! ID: ${ctx.from.id}`);
  }

  const formattedText = formatVocabularyMessage(text, wordCounter);

  if (!formattedText) {
    return ctx.reply(
      "⚠️ <b>Format xato!</b>\nKamida 4 qatordan iborat matn yuboring.",
    );
  }

  try {
    // ID ni tozalash
    const targetChat = CHANNEL_ID.replace(/['"]/g, "").trim();

    await ctx.telegram.sendMessage(targetChat, formattedText, {
      parse_mode: "HTML",
    });

    await ctx.reply(`✅ Kanalga <b>#word_${wordCounter}</b> bo'lib ketdi!`, {
      parse_mode: "HTML",
    });

    // Muvaffaqiyatli bo'lsa raqamni oshiramiz
    wordCounter++;
  } catch (error: any) {
    console.error("Xato:", error);
    await ctx.reply(
      `❌ <b>Xato:</b>\n${error.description || "Noma'lum xatolik"}\n\nID: ${CHANNEL_ID}`,
      { parse_mode: "HTML" },
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
