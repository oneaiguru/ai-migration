import React from 'react'
import ReactDOM from 'react-dom/client'

// Minimal test to see what's happening
console.log('🔍 main.tsx starting...')
console.log('React:', React)
console.log('ReactDOM:', ReactDOM)

const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (!rootElement) {
  console.error('❌ Root element not found!')
} else {
  console.log('✅ Root element found, attempting to create root...')
  
  try {
    const root = ReactDOM.createRoot(rootElement)
    console.log('✅ Root created successfully:', root)
    
    console.log('🚀 Attempting to render...')
    root.render(
      React.createElement('div', {
        style: { 
          padding: '20px', 
          color: 'green', 
          fontFamily: 'Arial' 
        }
      }, [
        React.createElement('h1', { key: 'title' }, '✅ Minimal React Test Working!'),
        React.createElement('p', { key: 'time' }, 'Time: ' + new Date().toLocaleString()),
        React.createElement('p', { key: 'status' }, 'React successfully mounted and rendering!')
      ])
    )
    console.log('✅ Render command completed!')
    
  } catch (error) {
    console.error('❌ Error during React setup:', error)
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial;">
        <h1>❌ React Error</h1>
        <p>Error: ${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `
  }
}