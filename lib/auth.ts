import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/server/db/schema";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:8081",

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      const deepLink = `flint://reset-password?token=${token}`;

      if (process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Flint <noreply@flintapp.co>",
            to: user.email,
            subject: "Reset your Flint password",
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
                <h1 style="font-size:28px;font-weight:700;color:#F97316;letter-spacing:-1px;margin:0 0 8px">flint</h1>
                <p style="font-size:16px;color:#111;margin:0 0 24px">Reset your password</p>
                <p style="font-size:15px;color:#4B5563;line-height:1.6;margin:0 0 28px">
                  Tap the button below to set a new password for your Flint account.
                  This link expires in 1 hour.
                </p>
                <a href="${deepLink}"
                   style="display:inline-block;background:#F97316;color:#fff;font-size:15px;font-weight:600;
                          text-decoration:none;padding:14px 28px;border-radius:12px">
                  Reset password →
                </a>
                <p style="font-size:13px;color:#9CA3AF;margin:28px 0 0">
                  If you didn't request this, you can safely ignore this email.
                </p>
              </div>
            `,
          }),
        });
      } else {
        // Dev fallback — open this URL on device to test the reset flow
        console.log("[flint] password reset link:", deepLink);
      }
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  plugins: [expo()],

  trustedOrigins: [
    "flint://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
});
