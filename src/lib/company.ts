// Public business details shown on the site and in legal pages.
// Set these in the environment before launch; empty values are simply hidden,
// never invented.
export const COMPANY = {
  brand: "EMMA",
  legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "LionsLane",
  city: process.env.NEXT_PUBLIC_COMPANY_CITY || "Nairobi, Kenya",
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "",
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "",
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || process.env.NEXT_PUBLIC_COMPANY_EMAIL || "",
  securityEmail: process.env.NEXT_PUBLIC_SECURITY_EMAIL || process.env.NEXT_PUBLIC_COMPANY_EMAIL || "",
};
