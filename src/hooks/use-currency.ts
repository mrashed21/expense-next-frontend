import { useCallback } from "react";
import { useSelector } from "react-redux";
import { formatCurrency as utilFormatCurrency } from "../lib/utils";
import { RootState } from "../redux/store";

export function useCurrency() {
  const { user } = useSelector((state: RootState) => state.auth);
  const currencyCode = user?.currency || "BDT";

  const formatCurrency = useCallback(
    (amount: number, locale = "en-US") => {
      return utilFormatCurrency(amount, currencyCode, locale);
    },
    [currencyCode],
  );

  return { currencyCode, formatCurrency };
}
