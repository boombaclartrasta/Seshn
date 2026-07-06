import "./globals.css";

export const metadata = {
  title: "SESHN",
  description: "Track study sessions, focus, streaks, and share progress.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SESHN",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-512.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
