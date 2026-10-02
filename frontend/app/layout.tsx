import "./globals.css";

export const metadata = {
  title: "OmniNexus OS",
  description: "Workforce Intelligence Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}