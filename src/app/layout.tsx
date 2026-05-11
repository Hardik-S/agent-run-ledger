import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Agent Run Ledger",
  description:
    "Auditable dashboard for shipped agent output, blockers, retries, token burn, and next actions.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
