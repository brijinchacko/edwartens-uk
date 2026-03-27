import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { COURSE_FEE_TOTAL_PENCE, DEPOSIT_AMOUNT_PENCE, COURSE_SLUG_REVERSE, COURSE_CONFIG } from "@/lib/course-config";
import { formatDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, qualification, batchId, paymentType } = body;

    if (!name || !email || !phone || !batchId || !paymentType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["deposit", "full"].includes(paymentType)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    // Verify batch exists and has seats
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: { _count: { select: { students: true } } },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch._count.students >= batch.capacity) {
      return NextResponse.json({ error: "This batch is fully booked" }, { status: 400 });
    }

    // Create or find Lead
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        qualification: qualification || null,
        courseInterest: batch.course,
        source: "website-checkout",
        status: "NEW",
      },
    });

    const amount = paymentType === "deposit" ? DEPOSIT_AMOUNT_PENCE : COURSE_FEE_TOTAL_PENCE;
    const courseConfig = COURSE_CONFIG[batch.course];
    const courseSlug = COURSE_SLUG_REVERSE[batch.course];

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        stripeSessionId: `pending_${Date.now()}`, // temp, updated after session creation
        amount,
        type: paymentType === "deposit" ? "DEPOSIT" : "FULL",
        status: "pending",
        customerEmail: email,
        customerName: name,
        phone,
        courseInterest: batch.course,
        batchId: batch.id,
        leadId: lead.id,
      },
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name:
                paymentType === "deposit"
                  ? `Seat Deposit - ${courseConfig?.title || "Course"} (${batch.name})`
                  : `${courseConfig?.title || "Course"} - Full Course Fee (inc VAT)`,
              description: `Batch: ${batch.name}, Start: ${formatDate(batch.startDate)}, Location: ${batch.location || "Milton Keynes"}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentId: payment.id,
        leadId: lead.id,
        batchId: batch.id,
        course: batch.course,
        paymentType,
        customerName: name,
        customerPhone: phone,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseSlug}/batch/${batch.id}/register?cancelled=true`,
    });

    // Update payment with actual Stripe session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
