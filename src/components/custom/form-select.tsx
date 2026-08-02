import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormClearErrors,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type SelectOption = {
  label: string;
  value: string;
};

type FormSelectProps<T extends FieldValues> = {
  icon?: React.ReactNode;
  label?: string;
  name: Path<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  clearErrors?: UseFormClearErrors<T>;
  searchable?: boolean;
  searchPlaceholder?: string;
};

const FormSelect = <T extends FieldValues>({
  icon,
  label,
  name,
  control,
  options,
  placeholder = "Select an option",
  error,
  disabled = false,
  rules,
  clearErrors,
  searchable = true,
  searchPlaceholder = "Search...",
}: FormSelectProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : options;

  return (
    <div className="flex flex-col w-full">
      <label className="mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              clearErrors?.(name);
            }}
            disabled={disabled}
            onOpenChange={(open) => {
              if (!open) setSearchQuery("");
            }}
          >
            <SelectTrigger className="h-10 w-full py-5!">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {searchable && (
                <div className="flex items-center border-b px-2 py-1.5 mb-1 sticky top-0 bg-popover z-10">
                  <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              )}
            </SelectContent>
          </Select>
        )}
      />
      <div className="min-h-5">
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
    </div>
  );
};

export default FormSelect;
