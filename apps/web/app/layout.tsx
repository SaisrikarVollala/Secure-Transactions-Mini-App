import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Transactions Mini-App",
  description: "Secure Transactions Mini-App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
