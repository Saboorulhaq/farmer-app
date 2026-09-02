// Hardcoded valid values to fast-forward the bank-credit-facility loan
// application (product_steps) while the app is in Debug Mode
// (useDebugStore.isDebugMode). In debug mode NO API calls are made — the config
// is loaded from src/config/procut-config-response.json, every field is
// prefilled, and "Next" just advances to the following step.
//
// NOTE: selected_farms / selected_harvest / nationality are sourced from
// external APIs which are skipped in debug, so their dropdowns render empty —
// the placeholder values below only satisfy step validity so Next stays enabled.
export const DEBUG_BANK_CREDIT_VALUES: Record<string, any> = {
  // Step 1 — Loan Request
  facility_type: 'bank_credit_facility',
  amount: 1000000, // within 500000–1500000, divisible by 500
  tenure: '6_months',
  intended_purpose: ['purchase_seeds', 'purchase_fertilizer'],

  // Step 2 — Personal Details
  name_as_per_id: 'Muhammad Ramzan',
  ghana_card_number: '35202-6787205-9',
  date_of_birth: '1990-02-15',
  gender: 'male',
  nationality: 'Pakistan',
  resident_ownership: 'owned',
  residential_address_details:
    'Makan No. 7/8, Mohalla M Block Gulberg 111, Lahore',
  is_politically_exposed_person: false,
  has_relative_in_dabidi_program: false,
  confirm_id_accuracy: true,

  // Step 3 — Farm Details (user picks from the real /farms API response)
  // Step 4 — Financial Profile (user picks from the real /harvest_details API response)
  // Borrowing details (lender, borrowing_facility_type, outstanding_amount) are
  // intentionally left empty in debug mode.

  // Step 5 — Documents (all optional)
  link_to_sale_agreement: false,
};
