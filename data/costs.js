// Cost records are intentionally separated from procedure records.
// This lets us later replace illustrative benchmarks with verified hospital-specific packages.

export const treatmentPackages = []

export const costRecordFields = [
  "procedureId",
  "hospitalId",
  "city",
  "packageMin",
  "packageMax",
  "currency",
  "hospitalChargesIncluded",
  "surgeonFeeIncluded",
  "implantIncluded",
  "diagnosticsIncluded",
  "accommodationIncluded",
  "exclusions",
  "validFrom",
  "validUntil",
  "source",
  "lastVerifiedAt",
]
