import { bot } from "@/lib/telegram";
import { NextResponse } from "next/server";
import { formatVocabularyMessage } from "@/lib/formatter";

// Next.js keshlab qo'ymasligi va har doim yangi so'rovni qabul qilishi uchun
export const dynamic = "force-dynamic";

const CHANNEL_ID = process.env.CHANNEL_ID as string;
const ADMIN_ID = Number(process.env.ADMIN_ID);

// 1. /start buyrug'i
bot.command("start", async (ctx) => {
  await ctx.reply(
    "<b>Assalomu alaykum!</b> Men Vocabot middleware'man. 🚀\n\n" +
      "Yangi so'z kiritish uchun format:\n" +
      "<code>Word | Definition | Example | Uzbek Note</code>",
    { parse_mode: "HTML" },
  );
});

// 2. /newword buyrug'i
bot.command("newword", async (ctx) => {
  await ctx.reply(
    "📝 <b>Yangi so'z kiritish tartibi:</b>\n\n" +
      "Ma'lumotlarni vertikal chiziq (<code>|</code>) bilan ajratib yuboring.\n\n" +
      "<b>Misol:</b>\n" +
      "<code>Ephemeral | Lasting for a very short time | Fame is ephemeral | O'tkinchi</code>",
    { parse_mode: "HTML" },
  );
});

// 3. /help buyrug'i
bot.command("help", async (ctx) => {
  await ctx.reply(
    "<b>Yordam:</b>\n" +
      "- Faqat admin so'z qo'sha oladi.\n" +
      "- So'zlarni '|' belgisi orqali 4 bo'lakda yuboring.\n" +
      "- Xatolik bo'lsa, @admin bilan bog'laning.",
    { parse_mode: "HTML" },
  );
});

// 4. Asosiy matnli xabarlar (Middleware qismi)
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // Agar xabar buyruq bo'lsa (masalan /start), bu handler uni o'tkazib yuboradi
  if (text.startsWith("/")) return;

  // Xavfsizlik: Faqat siz (admin) yubora olishingiz kerak
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply(`Sizda ruxsat yo'q. ❌\nSizning ID: ${ctx.from.id}`);
  }

  const formattedText = formatVocabularyMessage(text);

  if (!formattedText) {
    return ctx.reply(
      "⚠️ <b>Format xato!</b>\n\nIltimos, so'zlarni <code>|</code> belgisi bilan ajratib, 4 qismda yuboring.",
      { parse_mode: "HTML" },
    );
  }

  try {
    // .env dagi CHANNEL_ID ni tozalab, raqamga aylantiramiz
    const rawId = process.env.CHANNEL_ID || "";
    const cleanId = rawId.replace(/['"]/g, "").trim();

    // Telegram kanallari uchun ID raqam turida bo'lishi shart
    const targetChat = Number(cleanId);

    await ctx.telegram.sendMessage(targetChat, formattedText, {
      parse_mode: "HTML",
    });

    await ctx.reply("✅ Kanalga muvaffaqiyatli yuborildi!");
  } catch (error: any) {
    // Agar raqam formatida ham xato bersa, username bilan sinab ko'rish uchun:
    console.error("Xato tafsiloti:", error);
    await ctx.reply(
      `❌ Xato: ${error.description}\nKutilgan ID: ${process.env.CHANNEL_ID}`,
    );
  }

//   try {
//     // .env dagi qo'shtirnoqlarni tozalash
//     const cleanChannelId = String(CHANNEL_ID).replace(/['"]/g, "");

//     // Kanalga yuborish (HTML rejimida)
//     await ctx.telegram.sendMessage(cleanChannelId, formattedText, {
//       parse_mode: "HTML",
//     });

//     await ctx.reply("✅ <b>Kanalga muvaffaqiyatli yuborildi!</b>", {
//       parse_mode: "HTML",
//     });
//   } catch (error: any) {
//     console.error("Telegram error:", error);

//     let detailedError = "Bot kanalda admin ekanini tekshiring.";
//     if (error.response) {
//       detailedError = `Kod: ${error.response.error_code} - ${error.response.description}`;
//     }

//     await ctx.reply(`❌ <b>Xatolik yuz berdi:</b>\n${detailedError}`, {
//       parse_mode: "HTML",
//     });
//   }
});

// Webhook orqali Telegram xabarlarini qabul qilish
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Update handling error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
