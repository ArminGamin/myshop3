import type { Metadata } from "next";

// Asmeninis, naršyklėje saugomas sąrašas – paieškos sistemoms nerodomas.
export const metadata: Metadata = {
  title: "Išsaugotos dovanos",
  robots: { index: false, follow: true },
  alternates: { canonical: "/issaugotos-dovanos" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
