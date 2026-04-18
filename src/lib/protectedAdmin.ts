// Haupt-Admin-Account, der nicht bearbeitet oder gelöscht werden darf.
// Konfiguration via Env-Var PROTECTED_ADMIN_EMAIL.
export function getProtectedAdminEmail(): string | null {
  const email = process.env.PROTECTED_ADMIN_EMAIL?.toLowerCase().trim();
  return email || null;
}

export function isProtectedAdmin(email: string | null | undefined): boolean {
  const protectedEmail = getProtectedAdminEmail();
  if (!protectedEmail || !email) return false;
  return email.toLowerCase().trim() === protectedEmail;
}
