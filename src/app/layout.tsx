import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { IngredientProvider } from "@/contexts/IngredientContext";
import { RecipeProvider } from "@/contexts/RecipeContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import { PricingProvider } from "@/contexts/PricingContext";

export const metadata: Metadata = {
  title: "SLINSHOT : FILL YOUR DAY",
  description: "Mix and record your custom drink recipes",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased bg-stone-100 flex justify-center"
      >
        <LanguageProvider>
          <IngredientProvider>
            <RecipeProvider>
              <AdminProvider>
                <AnalyticsProvider>
                  <PricingProvider>
                    <div className="w-full min-h-screen flex flex-col">
                      {children}
                    </div>
                  </PricingProvider>
                </AnalyticsProvider>
              </AdminProvider>
            </RecipeProvider>
          </IngredientProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
