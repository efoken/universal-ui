import { createTheme } from '@universal-ui/core';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { StylesProvider } from './styles-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StylesProvider
          theme={createTheme({
            fonts: {
              body: {
                family: inter.style.fontFamily,
              } as any,
            },
          })}
        >
          {children}
        </StylesProvider>
      </body>
    </html>
  );
}
