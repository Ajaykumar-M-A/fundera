import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { INITIAL_FORM, STEPS } from "./register.constants";
import { buildRegistrationPayload, validateStep } from "./register.validation";

export function useRegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ ...INITIAL_FORM });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState("forward");

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const goToStep = (target) => {
    if (target < 1 || target > STEPS.length) return;
    setDirection(target > step ? "forward" : "back");
    setStep(target);
    setErrors({});
    setError("");
  };

  const nextStep = () => {
    const stepErrors = validateStep(step, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setDirection("forward");
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  const prevStep = () => {
    setErrors({});
    setError("");
    setDirection("back");
    setStep((s) => Math.max(s - 1, 1));
  };

  const submit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(6, form);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const payload = buildRegistrationPayload(form);
      await register(payload);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    form,
    errors,
    error,
    loading,
    direction,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    submit,
  };
}
