import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useState } from "react";
import type { FieldError } from "react-hook-form";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | FieldError;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  validate?: boolean;
}

const CustomInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={`w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground rounded-lg ${className || ""}`}
    />
  );
});

CustomInput.displayName = "CustomInput";

const PhonesInput = ({
  icon,
  label,
  required = false,
  value = "",
  onChange,
  error,
  readOnly = false,
  disabled = false,
  placeholder = "Enter phone number",
  className = "",
  validate = true,
}: PhoneInputProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (val: string | undefined) => {
    const phoneValue = val || "";

    if (validate && phoneValue && !isValidPhoneNumber(phoneValue)) {
      setValidationError("Invalid phone number for selected country");
    } else {
      setValidationError(null);
    }

    onChange?.(phoneValue);
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {icon && <span className="">{icon}</span>} {label && label}{" "}
        {label && required && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 font-bold text-destructive">*</span>
              </TooltipTrigger>

              <TooltipContent side="top">
                <p>Required Field</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </label>
      <div
        className={`flex items-center rounded-lg border bg-input/30 px-3 py-2 transition-all duration-200 ${
          displayError
            ? "border-destructive focus-within:ring-2 focus-within:ring-destructive/20"
            : "border-input focus-within:ring-2 focus-within:ring-ring/30 focus-within:border-ring"
        } ${readOnly ? "bg-muted cursor-default" : ""} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${className}`}
      >
        <PhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="BD"
          value={value}
          onChange={handleChange}
          readOnly={readOnly}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full [&_.PhoneInputCountrySelectArrow]:text-muted-foreground [&_.PhoneInputCountrySelectArrow]:border-muted-foreground"
          inputComponent={CustomInput}
        />
      </div>

      {displayError && (
        <p className="mt-1 text-sm text-destructive">
          {typeof displayError === "string"
            ? displayError
            : (displayError as FieldError).message}
        </p>
      )}
    </div>
  );
};

export default PhonesInput;
