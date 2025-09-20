import type React from "react"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">{children}</div>
    </div>
  )
}

