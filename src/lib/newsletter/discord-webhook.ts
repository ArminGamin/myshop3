const SOURCE_LABELS: Record<string, string> = {
  homepage: "Pradžios puslapis",
  footer: "Puslapio apačia",
  "popup-welcome": "Iššokantis langas",
  hero: "Pradžios sekcija",
};

function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export async function notifyDiscordNewsletter(input: { email: string; source: string }) {
  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!hook) return false;

  const payload = {
    embeds: [
      {
        title: "📬 Naujas naujienlaiškio prašymas",
        color: 0x5865f2,
        fields: [
          { name: "El. paštas", value: input.email, inline: true },
          { name: "Šaltinis", value: sourceLabel(input.source), inline: true },
          { name: "Sutikimas", value: "Taip", inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[NEWSLETTER-DISCORD] Nepavyko:", res.status, await res.text().catch(() => ""));
    }
    return res.ok;
  } catch (error) {
    console.error("[NEWSLETTER-DISCORD] Klaida:", error);
    return false;
  }
}
