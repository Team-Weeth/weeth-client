import { useState } from 'react';

interface UseImageDropOptions {
  onDrop: (file: File) => void;
  accept?: (file: File) => boolean;
}

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

function useImageDrop({ onDrop, accept = isImageFile }: UseImageDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  const dragHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && accept(file)) {
        onDrop(file);
      }
    },
  };

  return { isDragging, dragHandlers };
}

export { useImageDrop };
