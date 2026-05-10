'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { EliteInteractions } from '@/components/animations/EliteInteractions';
import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Zakaria Kardache - Portfolio</title>
      </head>
      <body>
        <Provider store={store}>
          <EliteInteractions />
          <div className="newspaper-container animate-entrance">
            {children}
          </div>
        </Provider>
      </body>
    </html>
  );
}
