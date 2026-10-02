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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem("omninexus-theme")==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}<FloatingNav /></body>
    </html>
  );
}