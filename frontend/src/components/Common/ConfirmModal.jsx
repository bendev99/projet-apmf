import { FiX, FiAlertTriangle } from "react-icons/fi";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  danger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 z-10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div
            className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
              danger ? "bg-red-100" : "bg-blue-100"
            }`}
          >
            <FiAlertTriangle
              className={`text-2xl ${
                danger ? "text-red-600" : "text-blue-600"
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-2">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2.5 rounded-lg transition font-medium ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
