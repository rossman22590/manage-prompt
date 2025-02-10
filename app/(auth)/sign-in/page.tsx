"use client";

import { createToastWrapper } from "@/components/core/toast";
import { ActionButton } from "@/components/form/button";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import toast from "react-hot-toast";
import { login, register } from "../actions";

const DISABLE_REGISTRATION = process.env.NEXT_PUBLIC_DISABLE_REGISTRATION === 'true';

export default function SignInForm() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (formData: FormData) => {
    const action = isLogin ? login : register;
    const result = await action(formData);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="m-6 flex h-full items-center justify-center">
      <Header />
      {createToastWrapper("dark")}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-hero text-4xl">
            {isLogin || DISABLE_REGISTRATION ? "Sign In" : "Register"}
          </CardTitle>
          <CardDescription>
            {isLogin || DISABLE_REGISTRATION
              ? "Enter your email below to login to your account."
              : "Enter your email below to create a new account."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <form action={handleSubmit}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@myapps.ai"
                name="email"
                required
              />

              <ActionButton
                variant="default"
                className="mt-2 w-full"
                label={isLogin || DISABLE_REGISTRATION ? "Sign in" : "Register"}
                loadingLabel={isLogin || DISABLE_REGISTRATION ? "Signing in..." : "Registering..."}
              />
            </form>

            {!DISABLE_REGISTRATION && (
              <button
                type="button"
                className="mt-4 text-blue-500 hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Need an account? Register" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


// "use client";

// import { createToastWrapper } from "@/components/core/toast";
// import { ActionButton } from "@/components/form/button";
// import { Header } from "@/components/layout/header";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import toast from "react-hot-toast";
// import { login } from "../actions";

// export default function SignInForm() {
//   return (
//     <div className="m-6 flex h-full items-center justify-center">
//       <Header />
//       {createToastWrapper("dark")}

//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-hero text-4xl">Get Started</CardTitle>
//           <CardDescription>
//             Enter your email below to login to your account.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-4">
//           <div className="grid gap-2">
//             <form
//               action={(formData) => {
//                 toast.promise(login(formData), {
//                   loading: "Logging in...",
//                   success: "Logged in!",
//                   error: "Failed to log in.",
//                 });
//               }}
//             >
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="john.doe@myapps.ai"
//                 name="email"
//                 required
//               />

//               <ActionButton
//                 variant="default"
//                 className="mt-2 w-full"
//                 label="Sign in"
//                 loadingLabel="Logging in..."
//               />
//             </form>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
