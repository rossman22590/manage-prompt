"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import logo from "../../public/images/logo.png";

type Props = {
  passwordAuthEnabled: boolean;
};

export function SignInForm({ passwordAuthEnabled }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [hasSendEmail, setHasSendEmail] = useState(false);

  const [showPasswordAuth, setShowPasswordAuth] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"sign-in" | "sign-up">(
    "sign-in",
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordProcessing, setPasswordProcessing] = useState(false);

  const signInWithMagicLink = useCallback(async () => {
    try {
      if (!email) return;
      setProcessing(true);
      toast.promise(
        signIn
          .magicLink({ email, callbackURL: "/start" })
          .then((result) => {
            if (result?.error) {
              throw new Error(result.error?.message);
            }

            setHasSendEmail(true);
          })
          .finally(() => {
            setProcessing(false);
          }),
        {
          loading: "Sending magic link...",
          success: "Magic link sent!",
          error: "Failed to send magic link.",
        },
      );
    } catch (error) {
      console.error(error);
    }
  }, [email]);

  const submitPasswordAuth = useCallback(async () => {
    if (!email || !password) return;
    setPasswordProcessing(true);
    try {
      const result =
        passwordMode === "sign-up"
          ? await signUp.email({
              email,
              password,
              name: name || email,
              callbackURL: "/start",
            })
          : await signIn.email({ email, password, callbackURL: "/start" });

      if (result?.error) {
        toast.error(result.error.message || "Authentication failed.");
        return;
      }

      router.push("/start");
    } catch (error) {
      console.error(error);
      toast.error("Authentication failed.");
    } finally {
      setPasswordProcessing(false);
    }
  }, [email, password, name, passwordMode, router]);

  return (
    <div className="m-6 flex h-full items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex lg:flex-1">
            <Image
              src={logo}
              alt="AI Tutor API"
              width={32}
              height={32}
              className="-mt-2 mr-2 rounded-md"
            />

            <Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
              <p className="relative">AI Tutor API</p>
            </Link>
          </div>

          <CardTitle className="text-hero text-2xl">Get Started</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                signInWithMagicLink();
              }
            }}
            value={email}
          />

          {hasSendEmail ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              An email has been sent to{" "}
              <span className="font-semibold">{email}</span> with a magic link
              to sign in.
            </p>
          ) : (
            <Button
              className="gap-2 disabled:opacity-50"
              disabled={processing}
              onClick={signInWithMagicLink}
            >
              Sign-in with Magic Link
            </Button>
          )}

          {passwordAuthEnabled && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or (local only)
                  </span>
                </div>
              </div>

              {!showPasswordAuth ? (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowPasswordAuth(true)}
                >
                  Sign in with email + password
                </Button>
              ) : (
                <>
                  <div className="flex gap-2 text-sm">
                    <button
                      type="button"
                      className={
                        passwordMode === "sign-in"
                          ? "font-semibold underline"
                          : "text-muted-foreground"
                      }
                      onClick={() => setPasswordMode("sign-in")}
                    >
                      Sign in
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <button
                      type="button"
                      className={
                        passwordMode === "sign-up"
                          ? "font-semibold underline"
                          : "text-muted-foreground"
                      }
                      onClick={() => setPasswordMode("sign-up")}
                    >
                      Create account
                    </button>
                  </div>

                  {passwordMode === "sign-up" && (
                    <>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </>
                  )}

                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        submitPasswordAuth();
                      }
                    }}
                  />

                  <Button
                    className="gap-2 disabled:opacity-50"
                    disabled={passwordProcessing || !email || !password}
                    onClick={submitPasswordAuth}
                  >
                    {passwordMode === "sign-up" ? "Create account" : "Sign in"}
                  </Button>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
