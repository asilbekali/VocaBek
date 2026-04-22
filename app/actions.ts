"use server";
import fs from "fs/promises";
import path from "path";
import { formatVocabularyMessage } from "@/lib/formatter";
import { Telegraf } from "telegraf";

const dbPath = path.join(process.cwd(), "database.json");
const bot = new Telegraf(process.env.BOT_TOKEN as string);

async function readDB() {
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    return data && data.trim() !== "" ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function checkUserAction(adminId: string) {
  // 1. .env master admin tekshiruvi
  if (adminId === process.env.ADMIN_ID) {
    return { exists: true, channelId: process.env.CHANNEL_ID };
  }
  // 2. database.json tekshiruvi
  const users = await readDB();
  const user = users.find((u: any) => u.adminId === adminId);
  return user ? { exists: true, channelId: user.channelId } : { exists: false };
}

export async function registerUserAction(adminId: string, channelId: string) {
  const users = await readDB();
  if (!users.find((u: any) => u.adminId === adminId)) {
    users.push({ adminId, channelId });
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2));
  }
  return { success: true };
}

export async function sendVocabAction(adminId: string, text: string) {
  try {
    // Formatlash
    const formatted = formatVocabularyMessage(text, 1);
    if (!formatted) return { error: "Format xato! 4 qator ma'lumot kiriting." };

    // Kanalni aniqlash
    let targetChannel = "";
    const users = await readDB();
    const user = users.find((u: any) => u.adminId === adminId);

    if (user && user.channelId && user.channelId.trim() !== "") {
      targetChannel = user.channelId;
    } else if (adminId === process.env.ADMIN_ID) {
      targetChannel = process.env.CHANNEL_ID as string;
    } else {
      // Fallback: Agar foydalanuvchida kanal bo'sh bo'lsa, .env dagi kanalga
      targetChannel = process.env.CHANNEL_ID as string;
    }

    if (!targetChannel) return { error: "Kanal ID topilmadi!" };

    await bot.telegram.sendMessage(targetChannel, formatted, {
      parse_mode: "HTML",
    });

    return { success: true };
  } catch (e: any) {
    console.error("TG Error:", e);
    return {
      error: `Telegram xatosi: ${e.description || "Bot adminligini tekshiring"}`,
    };
  }
}
