// This file is at: /app/dashboard/layout.tsx
// This is our NEW master Server Component layout.

import React from "react";
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/auth"; // We use our reliable auth helper
import DashboardClientContainer from "@/components/DashboardClientContainer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the user's data on the server.
  const user = await getUserFromSession();

  // 2. If user is somehow null, kick them to login.
  if (!user) {
    redirect("/login");
  }

  // 3. If user exists, render the Client Container
  // We pass the user data to it as a prop.
  return (
    <DashboardClientContainer user={user}>
      {children}
    </DashboardClientContainer>
  );
}
