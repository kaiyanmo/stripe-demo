export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Create Stripe Checkout Session
    if (
      request.method === "POST" &&
      url.pathname === "/create-checkout-session"
    ) {
      try {
        const body = new URLSearchParams();

        body.append("mode", "payment");
        body.append(
          "line_items[0][price]",
          "price_1UHlotLvPie0Am8iOsxcCpvm"
        );
        body.append("line_items[0][quantity]", "1");

        body.append(
          "success_url",
          `${url.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`
        );

        body.append(
          "cancel_url",
          `${url.origin}/`
        );

        const stripeResponse = await fetch(
          "https://api.stripe.com/v1/checkout/sessions",
          {
            method: "POST",

            headers: {
              "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body: body.toString(),
          }
        );

        const session = await stripeResponse.json();

        if (!stripeResponse.ok) {
          console.error("Stripe error:", session);

          return new Response(
            "Unable to create Checkout Session",
            { status: 500 }
          );
        }

        // Same behaviour as our Express version:
        // redirect browser to Stripe-hosted Checkout.
        return Response.redirect(session.url, 303);

      } catch (error) {
        console.error(error);

        return new Response(
          "Unable to create Checkout Session",
          { status: 500 }
        );
      }
    }

    // Create a Stripe Checkout Session to save/tokenize a card
    if (
      request.method === "POST" &&
      url.pathname === "/create-setup-session"
    ) {
      try {
        const body = new URLSearchParams();

        // Setup mode collects a payment method without charging the card
        body.append("mode", "setup");
        body.append("currency", "aud");

        body.append(
          "success_url",
          `${url.origin}/token-success.html?session_id={CHECKOUT_SESSION_ID}`
        );

        body.append(
          "cancel_url",
          `${url.origin}/`
        );

        const stripeResponse = await fetch(
          "https://api.stripe.com/v1/checkout/sessions",
          {
            method: "POST",

            headers: {
              "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },

            body: body.toString(),
          }
        );

        const session = await stripeResponse.json();

        if (!stripeResponse.ok) {
          console.error("Stripe setup error:", session);

          return new Response(
            "Unable to create Setup Session",
            { status: 500 }
          );
        }

        console.log("Setup Session created:", session.id);

        return Response.redirect(session.url, 303);

      } catch (error) {
        console.error("Setup Session error:", error);

        return new Response(
          "Unable to create Setup Session",
          { status: 500 }
        );
      }
    }

    // Everything else comes from /public
    return env.ASSETS.fetch(request);
  },
};
