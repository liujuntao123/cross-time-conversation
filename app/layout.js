import './global.css'

export const metadata = {
  title: "跨时空对话",
  description: "跨时空对话应用",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        {children}
      </body>
    </html>
  );
}
