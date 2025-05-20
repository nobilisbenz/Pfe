import { useEffect, useRef, useState } from 'react';

const LazyLoadElement = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef.current);
        }
      },
      {
        threshold,
        rootMargin: '50px',
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={elementRef}
      className={`lazy-load-element ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </div>
  );
};

export default LazyLoadElement; 