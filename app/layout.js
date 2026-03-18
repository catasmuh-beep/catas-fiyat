import "./globals.css";

export const metadata = {
  title: "Çataş Mühendislik Fiyat Programı",
  description: "Marka, model ve güç bazlı fiyat belirleme ve personel görüntüleme paneli",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
