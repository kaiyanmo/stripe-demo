require('dotenv').config();

const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Cloud hosting will provide PORT.
// Locally, default to 3000.
const PORT = process.env.PORT || 3000;

// Serve files from /public
app.use(express.static('public'));

// Create a Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {

    // Automatically determine whether we're running locally
    // or behind HTTPS on the deployed site.
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('host');
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price: 'price_1UHlotLvPie0Am8iOsxcCpvm',
          quantity: 1,
        },
      ],

      success_url:
        `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${baseUrl}/`,
    });

    console.log('Checkout Session created:', session.id);

    res.redirect(303, session.url);

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).send('Unable to create Checkout Session');
  }
});

app.listen(PORT, () => {
  console.log(`Stripe demo merchant running on port ${PORT}`);
});