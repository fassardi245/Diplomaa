"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function AuditLogoutListener() {
  const { user } = useUser();
  const lastEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      lastEmailRef.current = user.primaryEmailAddress.emailAddress;
    } 
    else if (!user && lastEmailRef.current) {
      
      const email = lastEmailRef.current;
      const data = { email: email };
      
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon('/api/auditoria/log-logout', blob);

      sessionStorage.removeItem(`audit_login_registered_${email}`);

      lastEmailRef.current = null;
    }
  }, [user]);

  return null;
}