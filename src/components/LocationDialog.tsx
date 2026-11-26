import { useState, type FormEvent } from "react";

type LocationDialogProps = {
  currentLocation: string;
  onChange: (location: string) => void;
  onClose: () => void;
  onSave: (location: string) => void;
};

export default function LocationDialog({
  currentLocation,
  onChange,
  onClose,
  onSave,
}: LocationDialogProps) {
  const [location, setLocation] = useState(currentLocation);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedLocation = location.trim();
    if (trimmedLocation) onSave(trimmedLocation);
  }

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <section
        aria-labelledby="location-dialog-title"
        aria-modal="true"
        className="location-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="dialog-heading">
          <h2 id="location-dialog-title">Choose your delivery location</h2>
          <button
            aria-label="Close"
            className="dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <p>
          Enter a city or postal code. Your delivery location updates as you
          type.
        </p>
        <p aria-live="polite" className="location-preview">
          Delivering to: <strong>{location.trim() || "Select address"}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="delivery-location-input">City or postal code</label>
          <input
            autoFocus
            id="delivery-location-input"
            onChange={(event) => {
              const nextLocation = event.target.value;
              setLocation(nextLocation);
              onChange(nextLocation);
            }}
            placeholder="e.g. Bengaluru 560037"
            required
            value={location}
          />
          <div className="dialog-actions">
            <button className="button button-dark" type="submit">
              Done
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
