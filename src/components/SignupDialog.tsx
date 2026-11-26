import { useState, type FormEvent } from "react";

type SignupDialogProps = {
  onClose: () => void;
};

export default function SignupDialog({ onClose }: SignupDialogProps) {
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const mobileNumber = identifier.replace(/[\s()-]/g, "");
    const isIndianMobile = /^(?:\+?91)?[6-9]\d{9}$/.test(mobileNumber);

    setErrorMessage(
      isEmail || isIndianMobile
        ? ""
        : "Enter a valid mobile number or email address.",
    );
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <section
        aria-labelledby="signup-dialog-title"
        aria-modal="true"
        className="signup-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="signup-dialog-header">
          <h2 id="signup-dialog-title">Sign in or create account</h2>
          <button
            aria-label="Close sign in dialog"
            className="dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-identifier">Enter mobile number or email</label>
          <input
            autoComplete="username"
            autoFocus
            id="signup-identifier"
            inputMode="email"
            name="identifier"
            required
            type="text"
          />
          {errorMessage && (
            <p className="signup-error" role="alert">
              {errorMessage}
            </p>
          )}
          <button className="button signup-continue" type="submit">
            Continue
          </button>
        </form>
        <p className="signup-legal">
          By continuing, you agree to Amazon&apos;s{" "}
          <span className="signup-inline-link">Conditions of Use</span> and{" "}
          <span className="signup-inline-link">Privacy Notice</span>.
        </p>
        <hr />
        <div className="signup-business">
          <strong>Buying for work?</strong>
          <span className="signup-inline-link">
            Create a free business account
          </span>
        </div>
      </section>
    </div>
  );
}
