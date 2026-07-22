import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#18181b',
          color: '#fafafa',
          fontSize: '13px',
          borderRadius: '0',
          padding: '12px 16px',
          letterSpacing: '0.02em',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#fafafa' },
        },
        error: {
          iconTheme: { primary: '#e11d48', secondary: '#fafafa' },
        },
      }}
    />
  )
}
