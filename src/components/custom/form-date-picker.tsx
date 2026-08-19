import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormClearErrors,
} from "react-hook-form";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FormDatePickerProps<T extends FieldValues> = {
  icon?: React.ReactNode;
  label?: string;
  name: Path<T>;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  clearErrors?: UseFormClearErrors<T>;
};

const FormDatePicker = <T extends FieldValues>({
  icon,
  label,
  name,
  control,
  error,
  disabled = false,
  rules,
  clearErrors,
}: FormDatePickerProps<T>) => {
  return (
    <div className="flex flex-col w-full">
      <label className="mb-1 text-xs font-semibold text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {icon && <span className="mr-1">{icon}</span>} {label && label}{" "}
        {label && rules?.required && (
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
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-secondary border-border text-xs text-foreground px-3 py-2 rounded-xl h-auto",
                  !field.value && "text-muted-foreground",
                  error && "border-destructive",
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {field.value ? (
                  format(new Date(field.value), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  clearErrors?.(name);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
      <div className="min-h-5">
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
    </div>
  );
};

export default FormDatePicker;
