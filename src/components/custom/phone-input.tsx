import { Suspense, lazy } from "react";
import type { FieldError } from "react-hook-form";

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  error?: string | FieldError;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  validate?: boolean;
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const PhonesInputImpl = lazy(() => import("./phone-input.impl"));

const PhonesInputWrapper = (props: PhoneInputProps) => {
  return (
    <Suspense
      fallback={
        <div className="h-10 w-full animate-pulse rounded-lg border border-border bg-muted" />
      }
    >
      <PhonesInputImpl {...props} />
    </Suspense>
  );
};

export default PhonesInputWrapper;
