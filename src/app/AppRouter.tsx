import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './AppShell'
import { AdBoardPage } from '@features/ad-board/components/AdBoardPage'

export const AppRouter = () => (
  <BrowserRouter>
    <AppShell>
      <Routes>
        <Route path="/" element={<AdBoardPage />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
)

export default AppRouter

