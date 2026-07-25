export const STEPS = [
  { id: 1, label: "Personal", title: "Personal Information" },
  { id: 2, label: "Address", title: "Address Details" },
  { id: 3, label: "Identity", title: "Identity Verification" },
  { id: 4, label: "Bank", title: "Bank Details" },
  { id: 5, label: "Trading", title: "Trading Profile" },
  { id: 6, label: "Review", title: "Review & Submit" },
];

export const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];

export const ACCOUNT_TYPES = ["Savings", "Current"];

export const INVESTMENT_EXPERIENCE = [
  "No experience",
  "Less than 1 year",
  "1-3 years",
  "3-5 years",
  "More than 5 years",
];

export const ANNUAL_INCOME = [
  "Below ₹3 Lakhs",
  "₹3 - ₹5 Lakhs",
  "₹5 - ₹10 Lakhs",
  "₹10 - ₹25 Lakhs",
  "Above ₹25 Lakhs",
];

export const RISK_APPETITE = ["Conservative", "Moderate", "Aggressive"];

export const INVESTMENT_GOALS = [
  "Wealth creation",
  "Retirement planning",
  "Short-term gains",
  "Regular income",
  "Capital preservation",
];

export const INITIAL_FORM = {
  full_name: "",
  email: "",
  mobile_number: "",
  password: "",
  confirm_password: "",
  date_of_birth: "",
  gender: "",
  address_line: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  pan_number: "",
  aadhaar_number: "",
  occupation: "",
  account_holder_name: "",
  bank_name: "",
  account_number: "",
  confirm_account_number: "",
  ifsc_code: "",
  branch_name: "",
  account_type: "Savings",
  investment_experience: "",
  annual_income: "",
  risk_appetite: "",
  investment_goal: "",
  terms_accepted: false,
  privacy_accepted: false,
};

export const REVIEW_SECTIONS = [
  {
    title: "Personal Information",
    step: 1,
    fields: [
      { key: "full_name", label: "Full Name" },
      { key: "email", label: "Email" },
      { key: "mobile_number", label: "Mobile Number" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "gender", label: "Gender" },
    ],
  },
  {
    title: "Address",
    step: 2,
    fields: [
      { key: "address_line", label: "Address Line" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
      { key: "pincode", label: "Pincode" },
    ],
  },
  {
    title: "Identity Verification",
    step: 3,
    fields: [
      { key: "pan_number", label: "PAN Number" },
      { key: "aadhaar_number", label: "Aadhaar Number", optional: true },
      { key: "occupation", label: "Occupation" },
    ],
  },
  {
    title: "Bank Details",
    step: 4,
    fields: [
      { key: "account_holder_name", label: "Account Holder Name" },
      { key: "bank_name", label: "Bank Name" },
      { key: "account_number", label: "Account Number", mask: true },
      { key: "ifsc_code", label: "IFSC Code" },
      { key: "branch_name", label: "Branch Name" },
      { key: "account_type", label: "Account Type" },
    ],
  },
  {
    title: "Trading Profile",
    step: 5,
    fields: [
      { key: "investment_experience", label: "Investment Experience" },
      { key: "annual_income", label: "Annual Income" },
      { key: "risk_appetite", label: "Risk Appetite" },
      { key: "investment_goal", label: "Investment Goal" },
    ],
  },
];
