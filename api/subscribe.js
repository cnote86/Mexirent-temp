export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, role } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    const response = await fetch(
      `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          first_name: role === "proveedor" ? "Proveedor" : "Cliente",
          unsubscribed: false,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(response.status).json({ error: data.message || "Failed to subscribe" });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
