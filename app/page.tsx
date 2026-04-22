import Image from "next/image";

export default function Home() {
  return (
    <main
      style={{ padding: "2rem", fontFamily: "sans-serif", textAlign: "center" }}
    >
      <h1>Vocabulary Bot Dashboard</h1>
      <p>Bot hozirda faol va Telegram kanaliga so'zlarni yuborishga tayyor.</p>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        <h3>Qanday ishlatiladi?</h3>
        <ul style={{ textAlign: "left" }}>
          <li>Botga o'ting</li>
          <li>
            Format: <strong>Word | Definition | Example | Uzbek Note</strong>
          </li>
          <li>Yuboring va kanalingizni tekshiring!</li>
        </ul>
      </div>

      <footer style={{ marginTop: "50px", color: "#666" }}>
        <p>&copy; 2026 Ta`limHub Project</p>
      </footer>
    </main>
  );
}
