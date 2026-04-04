"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function SuccessRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      router.replace(`/bestellung?session_id=${sessionId}`);
    } else {
      router.replace("/");
    }
  }, [sessionId, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-3">🌶️</div>
        <p className="text-gray-400">Weiterleitung...</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessRedirect />
    </Suspense>
  );
}
