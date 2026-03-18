import "./globals.css";

export const metadata = {
  title: "Çataş Fiyat Programı",
  description: "Çataş Mühendislik fiyat oluşturma programı",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
