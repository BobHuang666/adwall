import type { PropsWithChildren } from 'react'

export const AppShell = ({ children }: PropsWithChildren) => (
  <div className="app-shell">
    <header className="app-shell__header">
      <h1 className="app-shell__title">Mini广告墙</h1>
    </header>
    <main className="app-shell__main">{children}</main>
  </div>
)

export default AppShell

