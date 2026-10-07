// Public doctor directory data is now loaded from Supabase.
// This file only documents the expected shape for the backend/admin flow.
export const doctorFields = [
  "id", "slug", "fullName", "title", "specialty", "subSpecialty",
  "qualifications", "experienceYears", "city", "state", "hospitalIds",
  "procedureIds", "areasOfExpertise", "languages",
  "internationalPatientExperience", "profilePhoto", "profileSummary",
  "consultationAvailable", "featured", "verified", "lastVerifiedAt",
]
