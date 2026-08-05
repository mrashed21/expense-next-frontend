import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  header: {
    fontSize: 20,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#1e1e1e",
  },
  subheader: {
    fontSize: 11,
    color: "#666666",
    marginBottom: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 5,
  },
  statBox: {
    flexDirection: "column",
  },
  statLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  statValueIncome: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
    marginTop: 4,
  },
  statValueExpense: {
    fontSize: 14,
    color: "#f43f5e",
    fontWeight: "bold",
    marginTop: 4,
  },
  statValueNet: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "16.66%",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#4f46e5",
  },
  tableCol: {
    width: "16.66%",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tableCell: {
    margin: 5,
    fontSize: 9,
    color: "#374151",
  },
  amountIncome: {
    margin: 5,
    fontSize: 9,
    color: "#10b981",
    fontWeight: "bold",
  },
  amountExpense: {
    margin: 5,
    fontSize: 9,
    color: "#f43f5e",
    fontWeight: "bold",
  },
});

interface PdfReportProps {
  transactions: any[];
  periodLabel: string;
  totalIncome: string;
  totalExpense: string;
  netBalance: string;
  netBalanceRaw: number;
  formatDate: (date: string) => string;
  formatCurrency: (amount: number) => string;
}

export const PdfReportDocument = ({
  transactions,
  periodLabel,
  totalIncome,
  totalExpense,
  netBalance,
  netBalanceRaw,
  formatDate,
  formatCurrency,
}: PdfReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.header}>Expense Tracker Financial Statement</Text>
        <Text style={styles.subheader}>Period: {periodLabel}</Text>
        <Text style={styles.subheader}>
          Generated on: {new Date().toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Income</Text>
          <Text style={styles.statValueIncome}>{totalIncome}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Expense</Text>
          <Text style={styles.statValueExpense}>{totalExpense}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Net Balance</Text>
          <Text
            style={[
              styles.statValueNet,
              { color: netBalanceRaw >= 0 ? "#4f46e5" : "#f43f5e" },
            ]}
          >
            {netBalance}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Date</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Description</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Category</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Account</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Type</Text>
          </View>
          <View style={styles.tableColHeader}>
            <Text style={styles.tableCellHeader}>Amount</Text>
          </View>
        </View>
        {transactions.map((tx, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formatDate(tx.date)}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {tx.notes || tx.category_id?.name || "-"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {tx.category_id?.name || "-"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{tx.account_id?.name || "-"}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {(tx.type || "").toUpperCase()}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text
                style={
                  tx.type === "income" || tx.type === "refund"
                    ? styles.amountIncome
                    : styles.amountExpense
                }
              >
                {tx.type === "income" || tx.type === "refund"
                  ? `+${formatCurrency(tx.amount || 0)}`
                  : `-${formatCurrency(tx.amount || 0)}`}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
