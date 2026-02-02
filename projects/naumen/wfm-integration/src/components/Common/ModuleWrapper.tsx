import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCurrentModule } from '../../store/uiSlice'

interface ModuleConfig {
  url: string
  title: string
  description: string
}

interface ModuleWrapperProps {
  config: ModuleConfig
}

const ModuleWrapper: React.FC<ModuleWrapperProps> = ({ config }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setCurrentModule(config.title))
    return () => {
      dispatch(setCurrentModule(null))
    }
  }, [config.title, dispatch])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Модуль недоступен</h3>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить модуль "{config.title}"
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Проверьте, что модуль запущен на {config.url}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Загрузка модуля</h3>
            <p className="text-gray-600">{config.title}</p>
            <p className="text-sm text-gray-500 mt-2">{config.description}</p>
          </div>
        </div>
      )}

      {/* Module iframe */}
      <iframe
        src={config.url}
        title={config.title}
        className="module-iframe"
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        style={{
          width: '100%',
          height: 'calc(100vh - 120px)',
          border: 'none',
          display: isLoading ? 'none' : 'block'
        }}
      />
    </div>
  )
}

export default ModuleWrapper
