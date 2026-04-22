import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";

export const dynamic = "force-dynamic";

const ADMIN_ID = Number(process.env.ADMIN_ID);
const CHANNEL_ID = process.env.CHANNEL_ID as string;

// Vercel serverless bo'lgani uchun vaqti-vaqti bilan 1 ga qaytib qoladi.
// Shunda /set komandasi bilan to'g'irlab olasiz.
let wordCounter = 1;

// 1. /start buyrug'i
bot.command("start", async (ctx) => {
  await ctx.reply(
    "<b>Assalomu alaykum, Asilbek!</b>\nVocabot middleware ishga tushdi. 🚀",
    { parse_mode: "HTML" },
  );
});

// 2. /newword buyrug'i
bot.command("newword", async (ctx) => {
  await ctx.reply(
    "📝 <b>Yangi so'z kiritish tartibi:</b>\n\n" +
      "Ma'lumotlarni har birini yangi qatordan yuboring:\n" +
      "1. Word\n2. Definition\n3. Example\n4. Uzbek Note",
    { parse_mode: "HTML" },
  );
});

// 3. /help buyrug'i
bot.command("help", async (ctx) => {
  await ctx.reply(
    "<b>Yordam bo'limi:</b>\n\n" +
      "- So'z qo'shish uchun shunchaki matnni yuboring.\n" +
      "- Tartib raqamini o'zgartirish: <code>/set 10</code>\n\n" +
      "Murojaat uchun: @asilbek_nt",
    { parse_mode: "HTML" },
  );
});

// 4. /set buyrug'i (Counter-ni qo'lda to'g'irlash uchun)
bot.command("set", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  const num = parseInt(ctx.message.text.split(" ")[1]);
  if (!isNaN(num)) {
    wordCounter = num;
    await ctx.reply(`✅ Navbatdagi so'z tartibi <b>${num}</b> ga o'rnatildi.`, {
      parse_mode: "HTML",
    });
  }
});

// 5. Asosiy matn ishlovchisi
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text.startsWith("/")) return;

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply(`Sizda ruxsat yo'q. ❌\nID: ${ctx.from.id}`);
  }

  const formattedText = formatVocabularyMessage(text, wordCounter);

  if (!formattedText) {
    return ctx.reply(
      "⚠️ <b>Format xato!</b>\nKamida 4 qator ma'lumot yuboring.",
    );
  }

  try {
    const targetChat = CHANNEL_ID.replace(/['"]/g, "").trim();

    await ctx.telegram.sendMessage(targetChat, formattedText, {
      parse_mode: "HTML",
    });

    await ctx.reply(
      `✅ Kanalga <b>#word_${wordCounter}</b> bo'lib yuborildi!`,
      { parse_mode: "HTML" },
    );

    wordCounter++;
  } catch (error: any) {
    console.error("Telegram xatosi:", error);
    await ctx.reply(`❌ <b>Xatolik:</b>\n${error.description || "Noma'lum"}`);
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
