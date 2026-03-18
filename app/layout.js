import "./globals.css";

export const metadata = {
  title: "Çataş Fiyat Programı",
  description: "Vaillant, Demirdöküm, Protherm, ECA, Baykan, şofben, elektrikli kombi ve klima fiyat programı"
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}