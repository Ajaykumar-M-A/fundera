import { useEffect, useState } from "react";
import { fetchKyc, submitKyc } from "../../api/trading";
import "./KycPage.styles.css";

const EMPTY_KYC = {
  pan_card: null,
  aadhaar: "",
  selfie: null,
  phone_number: "",
  date_of_birth: "",
  occupation: "",
  annual_income: "",
  account_holder_name: "",
  bank_name: "",
  ifsc: "",
  account_number: "",
  nominee: "",
};

export default function KycPage() {
  const [form, setForm] = useState(EMPTY_KYC);
  const [kyc, setKyc] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKyc().then((data) => {
      if (data) {
        setKyc(data);
        setForm({ ...EMPTY_KYC, ...data, pan_card: null, selfie: null });
      }
    }).catch(() => {});
  }, []);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const saved = await submitKyc(form);
      setKyc(saved);
      setForm({ ...EMPTY_KYC, ...saved, pan_card: null, selfie: null });
      setMessage("KYC submitted for admin verification.");
    } catch (err) {
      setMessage(err?.message || "Failed to submit KYC. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-page">
      <section className="card">
        <h3>KYC Verification</h3>
        {kyc && (
          <p className={kyc.status === "REJECTED" ? "error" : "hint"}>
            Status: {kyc.status}{kyc.rejection_reason ? ` · ${kyc.rejection_reason}` : ""}
          </p>
        )}
        <form className="kyc-form" onSubmit={submit}>
          <Field label="ID Document" type="file" accept="image/*" value={form.pan_card} onChange={(value) => setField("pan_card", value)} />
          <Field label="Selfie" type="file" accept="image/*" value={form.selfie} onChange={(value) => setField("selfie", value)} />
          <Field label="Aadhaar Number" value={form.aadhaar} onChange={(value) => setField("aadhaar", value)} />
          <Field label="Phone Number" value={form.phone_number} onChange={(value) => setField("phone_number", value)} />
          <Field label="Date of Birth" type="date" value={form.date_of_birth} onChange={(value) => setField("date_of_birth", value)} />
          <Field label="Occupation" value={form.occupation} onChange={(value) => setField("occupation", value)} />
          <Field label="Annual Income" value={form.annual_income} onChange={(value) => setField("annual_income", value)} />
          <Field label="Account Holder Name" value={form.account_holder_name} onChange={(value) => setField("account_holder_name", value)} />
          <Field label="Bank Name" value={form.bank_name} onChange={(value) => setField("bank_name", value)} />
          <Field label="IFSC" value={form.ifsc} onChange={(value) => setField("ifsc", value.toUpperCase())} />
          <Field label="Account Number" value={form.account_number} onChange={(value) => setField("account_number", value)} />
          <Field label="Nominee" value={form.nominee} onChange={(value) => setField("nominee", value)} required={false} />
          {message && <p className={message.includes("submitted") ? "positive" : "error"}>{message}</p>}
          <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit KYC"}</button>
        </form>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = true, accept }) {
  const handleChange = (event) => {
    if (type === "file") {
      const file = event.target.files?.[0] ?? null;
      onChange(file);
      return;
    }
    onChange(event.target.value);
  };

  return (
    <label className="kyc-field">
      <span>{label}</span>
      <input
        type={type}
        accept={accept}
        {...(type === "file" ? {} : { value: value || "" })}
        required={required}
        onChange={handleChange}
      />
      {type === "file" && value && (
        <small className="file-name">Selected: {value.name || value}</small>
      )}
    </label>
  );
}
