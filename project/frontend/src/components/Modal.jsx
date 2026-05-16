// Backwards-compatible wrapper around the shadcn-style Dialog primitive.
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/Dialog';
import { cn } from '../lib/utils';

const sizeMap = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

const Modal = ({ open, onClose, title, children, footer, size = 'md' }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onClose?.()}>
    <DialogContent className={cn(sizeMap[size] || sizeMap.md)}>
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
      )}
      <div>{children}</div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export default Modal;
