"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

interface PromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  submitText?: string;
}

export function PromptDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  label = "Name",
  placeholder = "Enter value...",
  defaultValue = "",
  submitText = "Save",
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);

  React.useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-border">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="prompt-input" className="text-xs font-semibold">
              {label}
            </Label>
            <Input
              id="prompt-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="rounded-xl h-10 text-xs"
              autoFocus
            />
          </div>

          <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!value.trim()}
              className="rounded-xl h-9 text-xs font-semibold"
            >
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
