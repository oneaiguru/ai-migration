import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { setupRU as setupEmployeesRU } from 'employee-management'
import { setupRU as setupScheduleRU } from 'schedule'

setupEmployeesRU()
setupScheduleRU()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
