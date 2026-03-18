import "./globals.css";

export const metadata = {
  title: "Çataş Fiyat Listesi",
  description: "Personel için okunabilir, yönetici için düzenlenebilir fiyat sistemi"
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
