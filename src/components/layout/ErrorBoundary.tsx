import { Component, type ErrorInfo, type ReactNode } from "react";
import ErrorState from "../ui/ErrorState";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught application error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-[640px] px-5 py-10">
          <ErrorState
            message="An unexpected error occurred while rendering this page."
            onRetry={() => this.setState({ hasError: false })}
            title="Something went wrong"
          />
        </div>
      );
    }

    return this.props.children;
  }
}
