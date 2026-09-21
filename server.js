require('dotenv').config();

const express = require('express');
const Stripe = require('stripe');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = 3000;

// Serve files from /public
app.use(express.static('public'));

// Create a Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price: 'price_1UHlotLvPie0Am8iOsxcCpvm',
          quantity: 1,
        },
      ],

      success_url: `http://localhost:${PORT}/success.html`,
      cancel_url: `http://localhost:${PORT}/`,
    });

    console.log('Checkout Session created:', session.id);

    res.redirect(303, session.url);

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).send('Unable to create Checkout Session');
  }
});

app.listen(PORT, () => {
  console.log(`Demo merchant running at http://localhost:${PORT}`);
});