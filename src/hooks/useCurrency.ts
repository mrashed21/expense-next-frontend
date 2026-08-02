import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { formatCurrency as utilFormatCurrency } from "../lib/utils";

export function useCurrency() {
  const { user } = useSelector((state: RootState) => state.auth);
  const currencyCode = user?.currency || "BDT";

  const formatCurrency = (amount: number, locale = "en-US") => {
    return utilFormatCurrency(amount, currencyCode, locale);
  };

  return { currencyCode, formatCurrency };
}
