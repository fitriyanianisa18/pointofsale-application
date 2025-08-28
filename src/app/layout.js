import "./globals.css";

import ClientLayout from "./clientLayout";
import GlobalToast from "./components/globalToast";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[var(--neutral-grey1)] font-sans">
        <GlobalToast />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}