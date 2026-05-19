export const metadata = {
  title: 'Daily Market Briefing',
  description: 'US · ASX · Global market briefing powered by Claude',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
