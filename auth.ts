import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { prisma } from "./lib/utils/db";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "resend-email",
      type: "email" as const,
      from: process.env.EMAIL_FROM,
      server: {}, // This is required by NextAuth but will not be used
      async sendVerificationRequest({
        identifier: email,
        url,
        provider,
      }: {
        identifier: string;
        url: string;
        provider: { from: string };
      }) {
        const { host } = new URL(url);
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Use your Resend API key here:
              "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: provider.from,
              to: email,
              subject: `Sign in to AI Tutor API}`,
              html: `
                <body style="background-color: #f6f9fc; font-family: Arial, sans-serif; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Sign in to AI Tutor API</h1>
                    <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                      Click the button below to sign in to your account. If you didn't request this email, you can safely ignore it.
                    </p>
                    <div style="text-align: center;">
                      <a href="${url}" style="display: inline-block; background-color: #ff69b4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; font-weight: bold; transition: background-color 0.3s ease;">
                        Sign In
                      </a>
                    </div>
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">
                      If the button doesn't work, copy and paste this link into your browser: ${url}
                    </p>
                  </div>
                </body>
              `,
            }),
          });

          if (!response.ok) {
            throw new Error(`Resend API error: ${await response.text()}`);
          }
        } catch (error) {
          console.error("Failed to send verification email", error);
          throw new Error("Failed to send verification email");
        }
      },
    } as any, // Cast to `any` to bypass additional type checking for our custom provider.
  ],
  pages: {
    signIn: "/sign-in",
    newUser: "/start",
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);



// import { PrismaAdapter } from "@auth/prisma-adapter";
// import NextAuth from "next-auth";
// import { prisma } from "./lib/utils/db";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     {
//       id: "resend-email",
//       type: "email",
//       from: process.env.EMAIL_FROM,
//       server: {}, // This needs to be here, but can be empty
//       async sendVerificationRequest({ identifier: email, url }) {
//         const { host } = new URL(url);
//         try {
//           const response = await fetch("https://api.resend.com/emails", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${process.env.EMAIL_SERVER_PASSWORD}`,
//             },
//             body: JSON.stringify({
//               from: process.env.EMAIL_FROM,
//               to: email,
//               subject: `Sign in to ${host}`,
//               html: `
//                 <body style="background-color: #f6f9fc; font-family: Arial, sans-serif; padding: 20px;">
//                   <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
//                     <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">Sign in to ${host}</h1>
//                     <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">Click the button below to sign in to your account. If you didn't request this email, you can safely ignore it.</p>
//                     <div style="text-align: center;">
//                       <a href="${url}" style="display: inline-block; background-color: #ff69b4; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-size: 16px; font-weight: bold; text-align: center; transition: background-color 0.3s ease;">Sign In</a>
//                     </div>
//                     <p style="color: #999; font-size: 14px; margin-top: 30px;">If the button doesn't work, you can also copy and paste this link into your browser: ${url}</p>
//                   </div>
//                 </body>
//               `,
//             }),
//           });

//           if (!response.ok) {
//             throw new Error(`Resend API error: ${await response.text()}`);
//           }
//         } catch (error) {
//           console.error("Failed to send verification email", error);
//           throw new Error("Failed to send verification email");
//         }
//       },
//     },
//   ],
//   pages: {
//     signIn: "/sign-in",
//     newUser: "/start",
//   },
// });
