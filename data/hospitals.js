// Hospital directory records are loaded from Supabase.
// This file documents the expected public hospital shape.
export const hospitalFields = [
  "id", "name", "slug", "city", "state", "hospitalType",
  "accreditations", "keySpecialties", "keyProcedures",
  "internationalPatientServices", "address", "website",
  "airportInformation", "images", "description", "featured",
  "verified", "lastVerifiedAt",
]
