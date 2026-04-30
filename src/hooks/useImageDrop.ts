import { useState } from 'react';

interface UseImageDropOptions {
  onDrop: (file: File) => void;
}

function useImageDrop({ onDrop }: UseImageDropOptions) {
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
      if (file && file.type.startsWith('image/')) {
        onDrop(file);
      }
    },
  };

  return { isDragging, dragHandlers };
}

export { useImageDrop };
