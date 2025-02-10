"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/utils/db";
import { redirect } from "next/navigation";

const DISABLE_REGISTRATION = process.env.DISABLE_REGISTRATION === 'true';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return { success: false, message: "No account found with this email." };
  }

  await signIn("resend-email", formData);
  return { success: true, message: "Sign-in link sent to your email." };
}

export async function register(formData: FormData) {
  if (DISABLE_REGISTRATION) {
    return { success: false, message: "Registration is currently disabled." };
  }

  const email = formData.get('email') as string;
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return { success: false, message: "An account with this email already exists." };
  }

  await prisma.user.create({ data: { email } });
  await signIn("resend-email", formData);
  return { success: true, message: "Account created. Sign-in link sent to your email." };
}

export async function logout() {
  await signOut();
  redirect("/");
}



// "use server";

// import { signIn, signOut } from "@/auth";
// import { redirect } from "next/navigation";

// export async function login(formData: FormData) {
//   await signIn("resend-email", formData);
// }

// export async function logout() {
//   await signOut();
//   redirect("/");
// }
