import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  subject: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    const contact = await prisma.contactMessage.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        subject: subject || "General Inquiry",
        message,
        status: "UNREAD",
      },
    });

    return NextResponse.json({ success: true, contactId: contact.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Failed to submit message" }, { status: 500 });
  }
}
