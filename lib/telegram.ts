import { Telegraf } from "telegraf";

// Bot tokeni mavjudligini tekshiramiz
const token = process.env.BOT_TOKEN;

if (!token) {
  throw new Error("BOT_TOKEN environment oʻzgaruvchisi topilmadi!");
}

// Bot instansiyasini yaratamiz
export const bot = new Telegraf(token);

// Agar loyihada boshqa joyda bot funksiyalaridan (masalan, sendMessage)
// foydalanmoqchi bo'lsangiz, shunchaki shu fayldan import qilasiz.
