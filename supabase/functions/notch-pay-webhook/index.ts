import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const NOTCH_PAY_SECRET = Deno.env.get("NOTCH_PAY_SECRET_KEY");
    if (!NOTCH_PAY_SECRET) {
      return new Response(
        JSON.stringify({ error: "Notch Pay n'est pas configuré." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { event, data } = body;

    // Notch Pay sends events like "payment.success", "payment.failed"
    if (!event || !data) {
      return new Response(
        JSON.stringify({ error: "Payload invalide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = data.reference ?? data.tx_ref;
    const status = data.status;

    if (event === "payment.success" || status === "success") {
      // Update the payment record in Supabase
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && serviceRoleKey) {
        await fetch(`${supabaseUrl}/rest/v1/payments?reference=eq.${reference}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            status: "paid",
            paid_at: new Date().toISOString(),
          }),
        });
      }

      return new Response(
        JSON.stringify({ received: true, status: "updated" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (event === "payment.failed" || status === "failed") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && serviceRoleKey) {
        await fetch(`${supabaseUrl}/rest/v1/payments?reference=eq.${reference}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "apikey": serviceRoleKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            status: "failed",
          }),
        });
      }

      return new Response(
        JSON.stringify({ received: true, status: "failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ received: true, status: "ignored" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
