import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "parlelibre0@gmail.com";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Resend n'est pas configuré." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { name, email, message } = await req.json();

    if (
      typeof email !== "string" ||
      typeof message !== "string" ||
      !email.trim() ||
      !message.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return new Response(
        JSON.stringify({ error: "Email et message sont requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const escapeHtml = (value: string) => value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

    const safeName = typeof name === "string" ? escapeHtml(name) : "Anonyme";
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0f766e;">Nouveau message de contact — ParleLibre</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #44403c; width: 120px;">Nom :</td>
            <td style="padding: 8px 0; color: #292524;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #44403c;">Email :</td>
            <td style="padding: 8px 0; color: #292524;">${safeEmail}</td>
          </tr>
        </table>
        <h3 style="color: #44403c; margin-top: 24px;">Message</h3>
        <div style="background: #f5f5f4; border-radius: 8px; padding: 16px; white-space: pre-wrap; color: #292524; line-height: 1.6;">${safeMessage}</div>
        <p style="margin-top: 24px; font-size: 12px; color: #a8a29e;">
          Cet email a été envoyé automatiquement depuis le formulaire de contact du site ParleLibre.
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ParleLibre <onboarding@resend.dev>",
        to: ADMIN_EMAIL,
        subject: `Nouveau message de contact — ${typeof name === "string" && name.trim() ? name.trim() : "Anonyme"}`,
        html: emailHtml,
        reply_to: email.trim(),
      }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.text();
      console.error("Resend rejected email", resendResponse.status, errData);
      return new Response(
        JSON.stringify({ error: "Le message n’a pas pu être envoyé. Vérifiez l’adresse email et réessayez." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-contact-email failed", err);
    return new Response(
      JSON.stringify({ error: "Le message n’a pas pu être envoyé. Veuillez réessayer." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
