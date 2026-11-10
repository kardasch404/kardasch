'use client';

import { Provider } from 'react-redux';
import { usePathname } from 'next/navigation';
import { store } from '@/store';
import { EliteInteractions } from '@/components/animations/EliteInteractions';
import '@/styles/globals.css';
import '@/components/board/case-board.css';
import '@/components/board/detective-room.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Zakaria Kardache - Portfolio</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Provider store={store}>
          {pathname !== '/' && <EliteInteractions />}
          {children}
        </Provider>
      </body>
    </html>
  );
}
