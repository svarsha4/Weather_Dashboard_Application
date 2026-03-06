import './globals.css';

export const metadata = {
  title: 'Weather Dashboard',
  description: 'Search weather forecasts by city and country',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
