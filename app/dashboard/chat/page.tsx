"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Chat() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="ml-3 text-muted-foreground">Checking authentication...</p>
    </div>
  );
}
