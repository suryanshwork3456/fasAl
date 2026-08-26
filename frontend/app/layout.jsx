import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata = {
  title: "FasAI | Smart Crop & Farm AI Monitoring",
  description: "FasAI helps farmers monitor crop health, fields, weather and alerts with AI-powered insights.",
  applicationName: "FasAI",
  keywords: ["FasAI", "smart farming", "crop health", "AI agriculture", "farm monitoring"],
  icons: { icon: "/icon.png", apple: "/icon.png" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
