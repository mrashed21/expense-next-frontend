"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Info, Trash2 } from "lucide-react";
import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "default";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return (
          <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
        );
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 border-border">
        <div className="flex items-start gap-4">
          {getIcon()}
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || isLoading}
            className="rounded-xl h-9 text-xs"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading || isLoading}
            className="rounded-xl h-9 text-xs font-semibold"
          >
            {loading || isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
