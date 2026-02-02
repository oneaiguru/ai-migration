import { createRoot } from 'react-dom/client'
import { Root } from './Root'
import { setupRU } from './setupRU'

setupRU()

createRoot(document.getElementById('root')!).render(<Root />)
