"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";

const APP_ID = "cqwzmjsm";

declare global {
  interface Window {
    intercomSettings?: Record<string, unknown>;
    Intercom?: (cmd: string, ...args: unknown[]) => void;
  }
}

export function IntercomChat() {
  const { data: session } = useSession();

  useEffect(() => {
    const user = session?.user;
    const settings: Record<string, unknown> = {
      api_base: "https://api-iam.intercom.io",
      app_id: APP_ID,
    };
    if (user?.id) settings.user_id = user.id;
    if (user?.name) settings.name = user.name;
    if (user?.email) settings.email = user.email;
    const u = user as { createdAt?: Date } | undefined;
    if (u?.createdAt) settings.created_at = Math.floor(new Date(u.createdAt).getTime() / 1000);

    window.intercomSettings = settings;

    const ic = window.Intercom;
    if (typeof ic === "function") {
      ic("reattach_activator");
      ic("update", window.intercomSettings);
    } else {
      const d = document;
      const i = function (...args: unknown[]) {
        (i as unknown as { c: (a: IArguments) => void }).c(arguments);
      } as unknown as { q: unknown[]; c: (a: IArguments) => void };
      i.q = [];
      i.c = function (args: IArguments) {
        i.q.push(args);
      };
      window.Intercom = i as unknown as (cmd: string, ...args: unknown[]) => void;
      const load = () => {
        if (d.querySelector(`script[src*="intercom.io/widget"]`)) return;
        const s = d.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = `https://widget.intercom.io/widget/${APP_ID}`;
        const x = d.getElementsByTagName("script")[0];
        x?.parentNode?.insertBefore(s, x);
      };
      if (d.readyState === "complete") load();
      else window.addEventListener("load", load, false);
    }
  }, [session?.user?.id, session?.user?.name, session?.user?.email]);

  return null;
}
