'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationSmartcatProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-400',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-400',
  },
};

export default function NotificationSmartcat({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  show = true,
}: NotificationSmartcatProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (duration > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const style = notificationStyles[type];
  const IconComponent = style.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${isVisible ? 'animate-in slide-in-from-right-2' : 'animate-out slide-out-to-right-2'}`}>
      <div className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${style.textColor}`}>
              {title}
            </h3>
            {message && (
              <p className={`mt-1 text-sm ${style.textColor} opacity-90`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`inline-flex ${style.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-500`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
