import { useEffect, useRef, useState, type FormEvent } from "react";
import type { LocationStatus } from "../types";

type LocationDialogProps = {
  currentLocation: string;
  locationStatus: LocationStatus;
  locationError: string;
  onChange: (location: string) => void;
  onClose: () => void;
  onDetectLocation: () => void;
  onSave: (location: string) => void;
};

export default function LocationDialog({
  currentLocation,
  locationStatus,
  locationError,
  onChange,
  onClose,
  onDetectLocation,
  onSave,
}: LocationDialogProps) {
  const [location, setLocation] = useState(currentLocation);
  const userEditedRef = useRef(false);

  useEffect(() => {
    if (!userEditedRef.current) {
      setLocation(currentLocation);
    }
  }, [currentLocation]);

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
          Your current location is detected automatically when permission is
          granted, or you can enter a city or postal code manually.
        </p>
        {locationStatus === "loading" && (
          <div className="location-status is-loading" role="status">
            <span aria-hidden="true" className="location-spinner" />
            <span>Detecting your current location...</span>
          </div>
        )}
        {locationStatus === "error" && locationError && (
          <p className="location-status is-error" role="alert">
            {locationError}
          </p>
        )}
        <p aria-live="polite" className="location-preview">
          Delivering to:{" "}
          <strong>
            {location.trim() ||
              (locationStatus === "loading"
                ? "Detecting location..."
                : "Select address")}
          </strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="location-field-header">
            <label htmlFor="delivery-location-input">City or postal code</label>
            <button
              className="location-detect-button"
              disabled={locationStatus === "loading"}
              onClick={() => {
                userEditedRef.current = false;
                onDetectLocation();
              }}
              type="button"
            >
              {locationStatus === "loading"
                ? "Detecting..."
                : "Use current location"}
            </button>
          </div>
          <input
            autoComplete="street-address"
            enterKeyHint="done"
            id="delivery-location-input"
            onChange={(event) => {
              userEditedRef.current = true;
              const nextLocation = event.target.value;
              setLocation(nextLocation);
              onChange(nextLocation);
            }}
            placeholder="Enter city, area, or postal code"
            required
            type="text"
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
