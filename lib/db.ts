import fs from "fs";
import path from "path";

// Fayl manzili: loyihaning ildiz qismida database.json bo'ladi
const DB_PATH = path.join(process.cwd(), "database.json");

export interface UserConfig {
  adminId: number;
  channelId: string;
}

// Bazani o'qish funksiyasi
export function getDB(): UserConfig[] {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("DB o'qishda xato:", error);
    return [];
  }
}

// Bazaga yozish funksiyasi
export function saveToDB(users: UserConfig[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("DB yozishda xato:", error);
  }
}

export function findUser(adminId: number): UserConfig | null {
  // 1. Birinchi navbatda ENV faylni tekshirish
  if (adminId === Number(process.env.ADMIN_ID)) {
    return {
      adminId: Number(process.env.ADMIN_ID),
      channelId: process.env.CHANNEL_ID as string,
    };
  }

  // 2. Keyin JSON bazadan qidirish
  const users = getDB();
  return users.find((u) => u.adminId === adminId) || null;
}

export function registerUser(adminId: number, channelId: string) {
  const users = getDB();
  const index = users.findIndex((u) => u.adminId === adminId);

  if (index !== -1) {
    users[index].channelId = channelId;
  } else {
    users.push({ adminId, channelId });
  }

  saveToDB(users);
}
