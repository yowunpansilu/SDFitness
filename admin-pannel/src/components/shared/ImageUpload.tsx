import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  className?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/svg+xml'],
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);

    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Please upload a valid image file (${acceptedFormats.map(f => f.split('/')[1]).join(', ')})`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!value ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200',
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-dark-700 hover:border-purple-500/50 hover:bg-dark-800/50',
            error && 'border-red-500'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 rounded-full bg-dark-800">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} up to {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group">
          <div className="relative border-2 border-dark-700 rounded-lg overflow-hidden bg-dark-800">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-48 object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleClick}
                className="bg-dark-900/90 border-dark-700 hover:bg-dark-800"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemove}
                className="bg-dark-900/90 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
