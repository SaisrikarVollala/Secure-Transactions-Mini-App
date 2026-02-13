import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Transactions Mini-App",
  description: "Secure Transactions Mini-App",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-bs-theme="dark">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="bg-body-tertiary">{children}</body>
    </html>
  );
}
