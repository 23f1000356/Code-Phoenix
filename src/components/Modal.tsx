import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#141419] border-2 border-[#B11226] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-[0_0_50px_rgba(177,18,38,0.3)]">
        <div className="sticky top-0 bg-[#141419] border-b border-[#B11226]/30 px-6 py-4 flex items-center justify-between">
          {title && <h3 className="text-xl font-bold text-[#EDEDED]">{title}</h3>}
          <button
            onClick={onClose}
            className="ml-auto p-2 hover:bg-[#B11226]/20 rounded transition-colors"
          >
            <X className="w-6 h-6 text-[#EDEDED]" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
