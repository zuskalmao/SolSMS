import { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

const ImageWithFallback = ({ src, fallbackSrc, alt, className = '' }: ImageWithFallbackProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      setError(true);
    };
  }, [src, fallbackSrc]);

  if (isLoading) {
    return (
      <div className={`${className} bg-dark-light animate-pulse rounded-2xl flex items-center justify-center`}>
        <svg className="w-12 h-12 text-primary/40 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
    />
  );
};

export default ImageWithFallback;
