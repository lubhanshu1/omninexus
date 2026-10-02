import "./globals.css";
import FloatingNav from "@/components/FloatingNav";

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
      <body suppressHydrationWarning>{children}<FloatingNav /></body>
    </html>
  );
}