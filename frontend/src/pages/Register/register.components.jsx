import { Link } from "react-router-dom";
import {
  ACCOUNT_TYPES,
  ANNUAL_INCOME,
  GENDER_OPTIONS,
  INVESTMENT_EXPERIENCE,
  INVESTMENT_GOALS,
  REVIEW_SECTIONS,
  RISK_APPETITE,
} from "./register.constants";

function FieldError({ message }) {
  if (!message) return null;
  return <span className="field-error">{message}</span>;
}

export function FormField({ label, name, error, children, optional }) {
  return (
    <label className={`reg-field${error ? " has-error" : ""}`}>
      <span className="reg-label">
        {label}
        {optional && <span className="reg-optional"> (optional)</span>}
      </span>
      {children}
      <FieldError message={error} />
    </label>
  );
}

export function TextInput({ name, value, onChange, error, type = "text", placeholder, maxLength, autoComplete }) {
  return (
    <FormField label={null} name={name} error={error}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={error ? "input-error" : ""}
      />
    </FormField>
  );
}

function LabeledInput({ label, name, value, onChange, error, type = "text", placeholder, maxLength, optional, autoComplete }) {
  return (
    <FormField label={label} name={name} error={error} optional={optional}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        className={error ? "input-error" : ""}
      />
    </FormField>
  );
}

function LabeledSelect({ label, name, value, onChange, error, options, placeholder }) {
  return (
    <FormField label={label} name={name} error={error}>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={error ? "input-error" : ""}
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </FormField>
  );
}

export function StepPersonal({ form, errors, onChange }) {
  return (
    <div className="reg-grid">
      <LabeledInput label="Full Name" name="full_name" value={form.full_name} onChange={onChange} error={errors.full_name} placeholder="John Doe" autoComplete="name" />
      <LabeledInput label="Email" name="email" type="email" value={form.email} onChange={onChange} error={errors.email} placeholder="you@example.com" autoComplete="email" />
      <LabeledInput label="Mobile Number" name="mobile_number" type="tel" value={form.mobile_number} onChange={onChange} error={errors.mobile_number} placeholder="9876543210" maxLength={15} autoComplete="tel" />
      <LabeledInput label="Password" name="password" type="password" value={form.password} onChange={onChange} error={errors.password} placeholder="Min. 8 characters" autoComplete="new-password" />
      <LabeledInput label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={onChange} error={errors.confirm_password} placeholder="Re-enter password" autoComplete="new-password" />
      <LabeledInput label="Date of Birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={onChange} error={errors.date_of_birth} />
      <LabeledSelect label="Gender" name="gender" value={form.gender} onChange={onChange} error={errors.gender} options={GENDER_OPTIONS} placeholder="Select gender" />
    </div>
  );
}

export function StepAddress({ form, errors, onChange }) {
  return (
    <div className="reg-grid">
      <LabeledInput label="Address Line" name="address_line" value={form.address_line} onChange={onChange} error={errors.address_line} placeholder="House no., street, area" autoComplete="street-address" />
      <LabeledInput label="City" name="city" value={form.city} onChange={onChange} error={errors.city} placeholder="Mumbai" autoComplete="address-level2" />
      <LabeledInput label="State" name="state" value={form.state} onChange={onChange} error={errors.state} placeholder="Maharashtra" autoComplete="address-level1" />
      <LabeledInput label="Country" name="country" value={form.country} onChange={onChange} error={errors.country} placeholder="India" autoComplete="country-name" />
      <LabeledInput label="Pincode" name="pincode" value={form.pincode} onChange={onChange} error={errors.pincode} placeholder="400001" maxLength={10} autoComplete="postal-code" />
    </div>
  );
}

export function StepIdentity({ form, errors, onChange }) {
  return (
    <div className="reg-grid">
      <LabeledInput label="PAN Number" name="pan_number" value={form.pan_number} onChange={onChange} error={errors.pan_number} placeholder="ABCDE1234F" maxLength={10} />
      <LabeledInput label="Aadhaar Number" name="aadhaar_number" value={form.aadhaar_number} onChange={onChange} error={errors.aadhaar_number} placeholder="12-digit Aadhaar" maxLength={14} optional />
      <LabeledInput label="Occupation" name="occupation" value={form.occupation} onChange={onChange} error={errors.occupation} placeholder="Software Engineer" />
      <p className="reg-disclaimer">Identity details are stored for demonstration only. No real KYC verification is performed.</p>
    </div>
  );
}

export function StepBank({ form, errors, onChange }) {
  return (
    <div className="reg-grid">
      <LabeledInput label="Account Holder Name" name="account_holder_name" value={form.account_holder_name} onChange={onChange} error={errors.account_holder_name} placeholder="As per bank records" />
      <LabeledInput label="Bank Name" name="bank_name" value={form.bank_name} onChange={onChange} error={errors.bank_name} placeholder="State Bank of India" />
      <LabeledInput label="Account Number" name="account_number" type="password" value={form.account_number} onChange={onChange} error={errors.account_number} placeholder="Enter account number" maxLength={20} autoComplete="off" />
      <LabeledInput label="Confirm Account Number" name="confirm_account_number" value={form.confirm_account_number} onChange={onChange} error={errors.confirm_account_number} placeholder="Re-enter account number" maxLength={20} autoComplete="off" />
      <LabeledInput label="IFSC Code" name="ifsc_code" value={form.ifsc_code} onChange={onChange} error={errors.ifsc_code} placeholder="SBIN0001234" maxLength={11} />
      <LabeledInput label="Branch Name" name="branch_name" value={form.branch_name} onChange={onChange} error={errors.branch_name} placeholder="Main Branch" />
      <LabeledSelect label="Account Type" name="account_type" value={form.account_type} onChange={onChange} error={errors.account_type} options={ACCOUNT_TYPES} />
      <p className="reg-disclaimer">Bank details are for paper trading demo purposes only.</p>
    </div>
  );
}

export function StepTrading({ form, errors, onChange }) {
  return (
    <div className="reg-grid">
      <LabeledSelect label="Investment Experience" name="investment_experience" value={form.investment_experience} onChange={onChange} error={errors.investment_experience} options={INVESTMENT_EXPERIENCE} />
      <LabeledSelect label="Annual Income" name="annual_income" value={form.annual_income} onChange={onChange} error={errors.annual_income} options={ANNUAL_INCOME} />
      <LabeledSelect label="Risk Appetite" name="risk_appetite" value={form.risk_appetite} onChange={onChange} error={errors.risk_appetite} options={RISK_APPETITE} />
      <LabeledSelect label="Investment Goal" name="investment_goal" value={form.investment_goal} onChange={onChange} error={errors.investment_goal} options={INVESTMENT_GOALS} />
    </div>
  );
}

function maskAccount(value) {
  if (!value) return "—";
  if (value.length <= 4) return "****";
  return "*".repeat(value.length - 4) + value.slice(-4);
}

function formatReviewValue(key, value, mask) {
  if (!value) return "—";
  if (mask) return maskAccount(value);
  return value;
}

export function StepReview({ form, errors, onChange, onEdit }) {
  return (
    <div className="reg-review">
      {REVIEW_SECTIONS.map((section) => (
        <div key={section.title} className="reg-review-section card">
          <div className="reg-review-header">
            <h4>{section.title}</h4>
            <button type="button" className="btn-ghost reg-edit-btn" onClick={() => onEdit(section.step)}>
              Edit
            </button>
          </div>
          <dl className="reg-review-list">
            {section.fields.map(({ key, label, optional, mask }) => {
              const value = form[key];
              if (optional && !value) return null;
              return (
                <div key={key} className="reg-review-item">
                  <dt>{label}</dt>
                  <dd>{formatReviewValue(key, value, mask)}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}

      <div className="reg-checkboxes">
        <label className={`reg-checkbox${errors.terms_accepted ? " has-error" : ""}`}>
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={(e) => onChange("terms_accepted", e.target.checked)}
          />
          <span>
            I agree to the <Link to="/terms">Terms & Conditions</Link>
          </span>
          <FieldError message={errors.terms_accepted} />
        </label>
        <label className={`reg-checkbox${errors.privacy_accepted ? " has-error" : ""}`}>
          <input
            type="checkbox"
            checked={form.privacy_accepted}
            onChange={(e) => onChange("privacy_accepted", e.target.checked)}
          />
          <span>
            I agree to the <Link to="/privacy">Privacy Policy</Link>
          </span>
          <FieldError message={errors.privacy_accepted} />
        </label>
      </div>
    </div>
  );
}

export function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="reg-progress">
      <div className="reg-progress-bar">
        <div
          className="reg-progress-fill"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
      <div className="reg-progress-steps">
        {steps.map((s) => {
          const status = s.id < currentStep ? "completed" : s.id === currentStep ? "active" : "pending";
          return (
            <button
              key={s.id}
              type="button"
              className={`reg-progress-step ${status}`}
              onClick={() => s.id < currentStep && onStepClick(s.id)}
              disabled={s.id > currentStep}
              aria-current={s.id === currentStep ? "step" : undefined}
            >
              <span className="reg-progress-dot">{s.id < currentStep ? "✓" : s.id}</span>
              <span className="reg-progress-label">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
