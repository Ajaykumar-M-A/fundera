const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

function isAdult(dateStr) {
  if (!dateStr) return false;
  const dob = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) age--;
  return age >= 18;
}

function validateStep1(form) {
  const errors = {};
  if (!form.full_name.trim() || form.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters";
  }
  if (!form.email.trim() || !EMAIL_RE.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }
  const mobile = digitsOnly(form.mobile_number);
  if (mobile.length !== 10) {
    errors.mobile_number = "Mobile number must be 10 digits";
  }
  if (!form.password || form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  if (form.password !== form.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }
  if (!form.date_of_birth) {
    errors.date_of_birth = "Date of birth is required";
  } else if (!isAdult(form.date_of_birth)) {
    errors.date_of_birth = "You must be at least 18 years old";
  }
  if (!form.gender) {
    errors.gender = "Please select a gender";
  }
  return errors;
}

function validateStep2(form) {
  const errors = {};
  if (!form.address_line.trim() || form.address_line.trim().length < 5) {
    errors.address_line = "Address must be at least 5 characters";
  }
  if (!form.city.trim() || form.city.trim().length < 2) {
    errors.city = "City must be at least 2 characters";
  }
  if (!form.state.trim() || form.state.trim().length < 2) {
    errors.state = "State must be at least 2 characters";
  }
  if (!form.country.trim() || form.country.trim().length < 2) {
    errors.country = "Country must be at least 2 characters";
  }
  const pincode = form.pincode.trim();
  if (pincode.length < 4 || pincode.length > 10) {
    errors.pincode = "Pincode must be 4–10 characters";
  }
  return errors;
}

function validateStep3(form) {
  const errors = {};
  const pan = form.pan_number.trim().toUpperCase();
  if (!PAN_RE.test(pan)) {
    errors.pan_number = "Invalid PAN format (e.g. ABCDE1234F)";
  }
  const aadhaar = digitsOnly(form.aadhaar_number);
  if (aadhaar && aadhaar.length !== 12) {
    errors.aadhaar_number = "Aadhaar must be 12 digits if provided";
  }
  if (!form.occupation.trim() || form.occupation.trim().length < 2) {
    errors.occupation = "Occupation must be at least 2 characters";
  }
  return errors;
}

function validateStep4(form) {
  const errors = {};
  if (!form.account_holder_name.trim() || form.account_holder_name.trim().length < 2) {
    errors.account_holder_name = "Account holder name must be at least 2 characters";
  }
  if (!form.bank_name.trim() || form.bank_name.trim().length < 2) {
    errors.bank_name = "Bank name must be at least 2 characters";
  }
  const account = form.account_number.trim();
  if (account.length < 6 || account.length > 20) {
    errors.account_number = "Account number must be 6–20 characters";
  }
  if (form.account_number !== form.confirm_account_number) {
    errors.confirm_account_number = "Account numbers do not match";
  }
  const ifsc = form.ifsc_code.trim().toUpperCase();
  if (!IFSC_RE.test(ifsc)) {
    errors.ifsc_code = "Invalid IFSC code format";
  }
  if (!form.branch_name.trim() || form.branch_name.trim().length < 2) {
    errors.branch_name = "Branch name must be at least 2 characters";
  }
  if (!form.account_type) {
    errors.account_type = "Please select an account type";
  }
  return errors;
}

function validateStep5(form) {
  const errors = {};
  if (!form.investment_experience) {
    errors.investment_experience = "Please select your investment experience";
  }
  if (!form.annual_income) {
    errors.annual_income = "Please select your annual income";
  }
  if (!form.risk_appetite) {
    errors.risk_appetite = "Please select your risk appetite";
  }
  if (!form.investment_goal) {
    errors.investment_goal = "Please select your investment goal";
  }
  return errors;
}

function validateStep6(form) {
  const errors = {};
  if (!form.terms_accepted) {
    errors.terms_accepted = "You must accept the Terms & Conditions";
  }
  if (!form.privacy_accepted) {
    errors.privacy_accepted = "You must accept the Privacy Policy";
  }
  return errors;
}

const VALIDATORS = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep6,
};

export function validateStep(step, form) {
  const validator = VALIDATORS[step];
  if (!validator) return {};
  return validator(form);
}

export function buildRegistrationPayload(form) {
  const aadhaar = digitsOnly(form.aadhaar_number);
  return {
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    mobile_number: digitsOnly(form.mobile_number),
    password: form.password,
    date_of_birth: form.date_of_birth,
    gender: form.gender,
    address_line: form.address_line.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    pincode: form.pincode.trim(),
    pan_number: form.pan_number.trim().toUpperCase(),
    aadhaar_number: aadhaar || null,
    occupation: form.occupation.trim(),
    account_holder_name: form.account_holder_name.trim(),
    bank_name: form.bank_name.trim(),
    account_number: form.account_number.trim(),
    ifsc_code: form.ifsc_code.trim().toUpperCase(),
    branch_name: form.branch_name.trim(),
    account_type: form.account_type,
    investment_experience: form.investment_experience,
    annual_income: form.annual_income,
    risk_appetite: form.risk_appetite,
    investment_goal: form.investment_goal,
  };
}
