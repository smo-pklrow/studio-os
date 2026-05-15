import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'default') => {
    const id = ++nextId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col items-end gap-2 z-50 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            {t.type === 'success' && <i className="ti ti-check" style={{ fontSize: '13px' }} />}
            {t.type === 'error'   && <i className="ti ti-alert-circle" style={{ fontSize: '13px' }} />}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
