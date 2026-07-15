import { SignInForm } from "@/components/core/sign-in-form";
import { isPasswordAuthEnabled } from "@/lib/utils/feature-flags";

export default function SignInPage() {
  return <SignInForm passwordAuthEnabled={isPasswordAuthEnabled()} />;
}
