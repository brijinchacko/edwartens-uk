import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateTempPassword } from "@/lib/utils";
import { generateInvoice } from "@/lib/invoice";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const {
      paymentId,
      leadId,
      batchId,
      course,
      paymentType,
      customerName,
      customerPhone,
    } = session.metadata || {};

    if (!paymentId) {
      console.error("Webhook: Missing paymentId in metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const student = await prisma.$transaction(async (tx) => {
        // 1. Update Payment record
        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status: "completed",
            stripePaymentIntentId: session.payment_intent || null,
          },
        });

        // 2. Update Lead status
        if (leadId) {
          await tx.lead.update({
            where: { id: leadId },
            data: {
              status: paymentType === "full" ? "ENROLLED" : "QUALIFIED",
            },
          });
        }

        if (paymentType === "full") {
          // Full payment: create User + Student + assign to batch
          const existingUser = await tx.user.findUnique({
            where: { email: session.customer_email },
          });

          if (!existingUser) {
            const tempPassword = generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 12);

            // Get counsellor from lead's assignedTo
            let counsellorId = null;
            if (leadId) {
              const lead = await tx.lead.findUnique({
                where: { id: leadId },
                select: { assignedToId: true },
              });
              counsellorId = lead?.assignedToId || null;
            }

            const user = await tx.user.create({
              data: {
                email: session.customer_email,
                password: hashedPassword,
                name: customerName || "New Student",
                phone: customerPhone || null,
                role: "STUDENT",
                termsAccepted: true,
                termsAcceptedAt: new Date(),
              },
            });

            const student = await tx.student.create({
              data: {
                userId: user.id,
                course: course,
                batchId: batchId || null,
                status: "ONBOARDING",
                paymentStatus: "PAID",
                paidAmount: (session.amount_total || 0) / 100,
                stripePaymentId: session.payment_intent || null,
                counsellorId,
              },
            });

            // Update lead with student reference
            if (leadId) {
              await tx.lead.update({
                where: { id: leadId },
                data: { convertedToStudentId: student.id },
              });
            }

            // Update payment with student reference
            await tx.payment.update({
              where: { id: paymentId },
              data: { studentId: student.id },
            });

            // Log journey events
            await tx.studentJourney.create({
              data: {
                studentId: student.id,
                eventType: "STUDENT_CREATED",
                title: "Student Account Created",
                description: `Student account created after full payment via Stripe.`,
                createdBy: "stripe-webhook",
              },
            });

            await tx.studentJourney.create({
              data: {
                studentId: student.id,
                eventType: "FULL_PAYMENT",
                title: "Full Payment Received",
                description: `Full payment of £${(session.amount_total || 0) / 100} received via Stripe.`,
                createdBy: "stripe-webhook",
              },
            });

            // TODO: Send welcome email with tempPassword via Resend
            console.log(
              `[WELCOME EMAIL] To: ${session.customer_email}, Temp Password: ${tempPassword}`
            );

            return student;
          } else {
            // User already exists, check if student record exists
            const existingStudent = await tx.student.findUnique({
              where: { userId: existingUser.id },
            });
            if (existingStudent) {
              await tx.student.update({
                where: { id: existingStudent.id },
                data: {
                  paymentStatus: "PAID",
                  paidAmount: (session.amount_total || 0) / 100,
                  stripePaymentId: session.payment_intent || null,
                  batchId: batchId || existingStudent.batchId,
                },
              });

              // Log journey event for full payment upgrade
              await tx.studentJourney.create({
                data: {
                  studentId: existingStudent.id,
                  eventType: "FULL_PAYMENT",
                  title: "Full Payment Received",
                  description: `Full payment of £${(session.amount_total || 0) / 100} received via Stripe.`,
                  createdBy: "stripe-webhook",
                },
              });

              return existingStudent;
            }

            return null;
          }
        } else {
          // Deposit: add note to lead
          if (leadId) {
            await tx.leadNote.create({
              data: {
                leadId: leadId,
                content: `Deposit of £100 received via Stripe. Session: ${session.id}`,
                createdBy: "stripe-webhook",
              },
            });
          }

          // Deposit: Create User + Student in ONBOARDING with PARTIAL payment
          const existingUser = await tx.user.findUnique({
            where: { email: session.customer_email },
          });

          if (!existingUser) {
            const tempPassword = generateTempPassword();
            const hashedPassword = await bcrypt.hash(tempPassword, 12);

            const user = await tx.user.create({
              data: {
                email: session.customer_email,
                password: hashedPassword,
                name: customerName || "New Student",
                phone: customerPhone || null,
                role: "STUDENT",
                termsAccepted: false,
                // termsAcceptedAt left null - will be set during onboarding
              },
            });

            // Get counsellor from lead's assignedTo
            let counsellorId = null;
            if (leadId) {
              const lead = await tx.lead.findUnique({
                where: { id: leadId },
                select: { assignedToId: true },
              });
              counsellorId = lead?.assignedToId || null;
            }

            const student = await tx.student.create({
              data: {
                userId: user.id,
                course: course,
                batchId: batchId || null,
                status: "ONBOARDING",
                paymentStatus: "PARTIAL",
                paidAmount: (session.amount_total || 0) / 100,
                stripePaymentId: session.payment_intent || null,
                counsellorId,
              },
            });

            // Update payment and lead
            await tx.payment.update({
              where: { id: paymentId },
              data: { studentId: student.id },
            });

            if (leadId) {
              await tx.lead.update({
                where: { id: leadId },
                data: { convertedToStudentId: student.id },
              });
            }

            // Log journey event
            await tx.studentJourney.create({
              data: {
                studentId: student.id,
                eventType: "STUDENT_CREATED",
                title: "Student Account Created",
                description: `Student account created after deposit payment via Stripe.`,
                createdBy: "stripe-webhook",
              },
            });

            await tx.studentJourney.create({
              data: {
                studentId: student.id,
                eventType: "DEPOSIT_PAID",
                title: "Deposit Payment Received",
                description: `£100 deposit paid via Stripe. Student account created.`,
                createdBy: "stripe-webhook",
              },
            });

            console.log(`[WELCOME EMAIL] To: ${session.customer_email}, Temp Password: ${tempPassword}`);

            return student;
          }

          return null;
        }
      });

      // Generate invoice
      if (student) {
        try {
          await generateInvoice(paymentId, student.id);
        } catch (invoiceError) {
          console.error("Invoice generation error:", invoiceError);
        }
      }
    } catch (error) {
      console.error("Webhook processing error:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
