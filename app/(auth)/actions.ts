"use server";

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  await signIn("resend-email", formData);
}

export async function logout() {
  await signOut();
  redirect("/");
}
