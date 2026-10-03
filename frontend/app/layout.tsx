import "./globals.css";
import FloatingNav from "@/components/FloatingNav";
import AuthGate from "@/components/AuthGate";

export const metadata = {
  title: "OmniNexus OS",
  description: "OmniNexus — career intelligence operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem("omninexus-theme")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`,
          }}
        />
      </head>
      <body suppressHydrationWarning><AuthGate>{children}</AuthGate><FloatingNav /></body>
    </html>
  );
}