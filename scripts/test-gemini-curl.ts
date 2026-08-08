const url1 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=FAKE_KEY";

async function run() {
  const payload = {
    system_instruction: { parts: [{ text: "System prompt" }] },
    contents: [{ role: "user", parts: [{ text: "Hello" }] }],
    generationConfig: { responseMimeType: "application/json" }
  };

  const res = await fetch(url1, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

run();
