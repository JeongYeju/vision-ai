import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울 2070: 두 개의 미래",
  description:
    "세 명의 관람객이 서로 다른 도시 문제를 발견하고 서울형 식물을 완성하는 풀스크린 협동 전시 데모",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "서울 2070: 두 개의 미래",
    description: "서로 다른 세 시선이 새로운 서울형 식물을 만듭니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
