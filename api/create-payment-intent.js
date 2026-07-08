const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { computeCharge } = require('../lib/pricing');
const { applyCors } = require('../lib/cors');

module.exports = async (req, res) => {
    if (applyCors(req, res)) return; // handled a CORS preflight
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentType, assessmentAmountCents, paymentMethodType, name, address, memberNum } =
        req.body || {};

    // Basic input validation
    if (!name || !memberNum) {
        return res.status(400).json({ error: 'Name and member number are required.' });
    }
    if (paymentMethodType !== 'card' && paymentMethodType !== 'ach') {
        return res.status(400).json({ error: 'Invalid payment method.' });
    }

    // Server decides the amount
    let charge;
    try {
        charge = computeCharge({ paymentType, assessmentAmountCents, paymentMethodType });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }

    try {
        let customerId = null;

        // Stripe recommends a Customer for ACH; also gives the treasurer a named
        // record to reconcile against.
        if (paymentMethodType === 'ach') {
            const customer = await stripe.customers.create({
                name: name,
                metadata: { memberNumber: memberNum },
            });
            customerId = customer.id;
        }

        const paymentIntentOptions = {
            amount: charge.total, // server-computed cents — the only amount that counts
            currency: 'usd',
            payment_method_types: [paymentMethodType === 'ach' ? 'us_bank_account' : 'card'],
            metadata: {
                memberNumber: memberNum,
                memberName: name,
                memberAddress: address || '',
                paymentType: paymentType,
                subtotalCents: String(charge.subtotal),
                feeCents: String(charge.fee),
            },
        };
        if (customerId) paymentIntentOptions.customer = customerId;

        const paymentIntent = await stripe.paymentIntents.create(paymentIntentOptions);

        return res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            amount: charge.total,
        });
    } catch (e) {
        console.error('Stripe Error:', e.message);
        return res.status(400).json({ error: e.message });
    }
};
