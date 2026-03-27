import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { COURSE_FEE_TOTAL, COURSE_CONFIG } from "@/lib/course-config";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      include: { batch: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Already fully paid" }, { status: 400 });
    }

    const paidAlready = student.paidAmount || 0;
    const remaining = COURSE_FEE_TOTAL - paidAlready;

    if (remaining <= 0) {
      return NextResponse.json({ error: "No remaining balance" }, { status: 400 });
    }

    const courseConfig = COURSE_CONFIG[student.course];

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${courseConfig?.title || "Course"} - Remaining Balance`,
              description: student.batch
                ? `Batch: ${student.batch.name}`
                : "Course fee balance",
            },
            unit_amount: remaining * 100, // convert to pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        studentId: student.id,
        userId: session.user.id,
        type: "remaining_balance",
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/student/payments?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/student/payments?cancelled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create payment session error:", error);
    return NextResponse.json(
      { error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
