"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email) {
    throw new Error("Email is required");
  }

  // Send verification email
  try {
    await sendVerificationEmail(email);
  } catch (error) {
    console.error("Failed to send verification email", error);
    throw new Error("Failed to send verification email");
  }

  // Sign in the user
  await signIn("credentials", { email, redirect: false });

  // Redirect to the new user page or dashboard
  redirect("/start");
}

async function sendVerificationEmail(email: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Sign in to your account",
      html: `<p>You've successfully signed in to your account.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${await response.text()}`);
  }
}
