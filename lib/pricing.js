// ---------------------------------------------------------------------------
// PRICING — the SERVER is the source of truth. The browser can display totals,
// but it never decides what is actually charged. To change the standard dues,
// edit DUES_CENTS. Keep the FEE_* values in sync with index.html.
// ---------------------------------------------------------------------------
const DUES_CENTS = 10000;             // $100.00 standard yearly dues
const ASSESSMENT_MIN_CENTS = 100;     // $1.00 floor for a special assessment
const ASSESSMENT_MAX_CENTS = 2000000; // $20,000 sanity cap — adjust to taste

const FEE_CARD_PERCENT = 0.029;
const FEE_CARD_FIXED_CENTS = 30;
const FEE_ACH_PERCENT = 0.008;
const FEE_ACH_CAP_CENTS = 500;

function computeCharge({ paymentType, assessmentAmountCents, paymentMethodType }) {
    // 1) Authoritative subtotal comes from the *type*, not a client-sent amount
    let subtotal;
    if (paymentType === 'standard') {
        subtotal = DUES_CENTS;
    } else if (paymentType === 'assessment') {
        const a = Number(assessmentAmountCents);
        if (!Number.isInteger(a) || a < ASSESSMENT_MIN_CENTS || a > ASSESSMENT_MAX_CENTS) {
            throw new Error('Please enter a valid assessment amount.');
        }
        subtotal = a;
    } else {
        throw new Error('Invalid payment type.');
    }

    // 2) Add the surcharge, mirroring the client math exactly
    let fee;
    if (paymentMethodType === 'ach') {
        fee = Math.min(Math.round(subtotal * FEE_ACH_PERCENT), FEE_ACH_CAP_CENTS);
    } else {
        // Card: gross up so the association nets the subtotal after Stripe's cut
        const subtotalDollars = subtotal / 100;
        const totalDollars =
            (subtotalDollars + FEE_CARD_FIXED_CENTS / 100) / (1 - FEE_CARD_PERCENT);
        fee = Math.round(totalDollars * 100) - subtotal;
    }

    return { subtotal, fee, total: subtotal + fee };
}

module.exports = { computeCharge, DUES_CENTS };
