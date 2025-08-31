import { toast } from 'sonner'

export const useToast = () => {
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
      position: 'top-right',
    })
  }

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
      position: 'top-right',
    })
  }

  const warning = (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
      position: 'top-right',
    })
  }

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
      position: 'top-right',
    })
  }

  const loading = (message: string, description?: string) => {
    return toast.loading(message, {
      description,
      position: 'top-right',
    })
  }

  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId)
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
  }
} 