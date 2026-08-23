"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PhoneInputBd } from "bd-number-validator/react";
import React from "react";
import type { FieldError } from "react-hook-form";

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

const PhonesInput = ({
  icon,
  label,
  required = false,
  value = "",
  onChange,
  error,
  readOnly = false,
  disabled = false,
  placeholder = "e.g. 01700000000",
}: PhoneInputProps) => {
  const displayError = error
    ? typeof error === "string"
      ? error
      : (error as FieldError).message
    : undefined;

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
          {required && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="ml-0.5 font-bold text-destructive">*</span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Required Field</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </label>
      )}

      <PhoneInputBd
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled || readOnly}
        styles={{
          container: { width: "100%" },
          inputWrapper: ({ hasError, isFocused }) => ({
            display: "flex",
            alignItems: "center",
            borderRadius: "0.5rem",
            border: `1px solid ${
              hasError || displayError
                ? "hsl(var(--destructive))"
                : isFocused
                  ? "hsl(var(--ring))"
                  : "hsl(var(--input))"
            }`,
            background: "hsl(var(--input) / 0.3)",
            padding: "0.375rem 0.75rem",
            gap: "0.5rem",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: isFocused
              ? hasError || displayError
                ? "0 0 0 2px hsl(var(--destructive) / 0.2)"
                : "0 0 0 2px hsl(var(--ring) / 0.3)"
              : "none",
            opacity: disabled || readOnly ? 0.6 : 1,
            cursor: readOnly ? "default" : "text",
          }),
          prefix: {
            color: "hsl(var(--muted-foreground))",
            fontSize: "0.875rem",
            fontWeight: 500,
            userSelect: "none",
          },
          input: {
            flex: 1,
            background: "transparent",
            outline: "none",
            border: "none",
            fontSize: "0.875rem",
            color: "hsl(var(--foreground))",
          },
          error: { display: "none" },
          label: { display: "none" },
        }}
      />

      {displayError && (
        <p className="mt-1 text-sm text-destructive">{displayError}</p>
      )}
    </div>
  );
};

export default PhonesInput;
