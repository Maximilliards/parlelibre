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
        JSON.stringify({ error: "Notch Pay n'est pas configuré. Ajoutez NOTCH_PAY_SECRET_KEY dans les secrets." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { amount, currency, reference, description, customer_name, customer_email, customer_phone, callback_url } = body;

    if (!amount || !reference) {
      return new Response(
        JSON.stringify({ error: "Montant et référence sont requis." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a payment intent with Notch Pay API
    // Docs: https://documenter.getpostman.com/view/36525869/2A9YxJTY
    const notchPayResponse = await fetch("https://api.notchpay.co/v1/payments/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTCH_PAY_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: currency ?? "XOF",
        reference,
        description: description ?? "Séance d'écoute ParleLibre",
        customer: {
          name: customer_name,
          email: customer_email,
          phone: customer_phone,
        },
        callback_url: callback_url,
      }),
    });

    const data = await notchPayResponse.json();

    if (!notchPayResponse.ok) {
      return new Response(
        JSON.stringify({ error: data.message ?? "Erreur lors de l'initialisation du paiement Notch Pay." }),
        { status: notchPayResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        authorization_url: data.authorization_url ?? data.data?.authorization_url,
        reference: data.reference ?? reference,
        status: "initialized",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
