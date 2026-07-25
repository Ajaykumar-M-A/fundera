import { Link } from "react-router-dom";
import { useRegisterForm } from "./register.functions";
import { STEPS } from "./register.constants";
import {
  StepProgress,
  StepPersonal,
  StepAddress,
  StepIdentity,
  StepBank,
  StepTrading,
  StepReview,
} from "./register.components";
import "./Register.styles.css";

const STEP_COMPONENTS = {
  1: StepPersonal,
  2: StepAddress,
  3: StepIdentity,
  4: StepBank,
  5: StepTrading,
  6: StepReview,
};

export default function Register() {
  const {
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
  } = useRegisterForm();

  const StepContent = STEP_COMPONENTS[step];
  const currentStep = STEPS[step - 1];
  const isLastStep = step === STEPS.length;

  return (
    <div className="auth-page reg-page">
      <div className="card auth-card reg-card">
        <div className="reg-header">
          <h2>Open Trading Account</h2>
          <p className="auth-subtitle">
            Paper trading platform — start with ₹1,00,000 virtual balance
          </p>
        </div>

        <StepProgress steps={STEPS} currentStep={step} onStepClick={goToStep} />

        <form
          className="auth-form reg-form"
          onSubmit={isLastStep ? submit : (e) => { e.preventDefault(); nextStep(); }}
          noValidate
        >
          <div className={`reg-step-content reg-animate-${direction}`} key={step}>
            <h3 className="reg-step-title">{currentStep.title}</h3>
            <StepContent
              form={form}
              errors={errors}
              onChange={updateField}
              onEdit={goToStep}
            />
          </div>

          {error && <p className="error reg-global-error">{error}</p>}

          <div className="reg-actions">
            {step > 1 && (
              <button type="button" className="btn-ghost reg-btn-back" onClick={prevStep} disabled={loading}>
                Back
              </button>
            )}
            {isLastStep ? (
              <button type="submit" className="reg-btn-submit" disabled={loading}>
                {loading ? "Creating account..." : "Register"}
              </button>
            ) : (
              <button type="submit" className="reg-btn-next">
                Continue
              </button>
            )}
          </div>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
