import type {RefObject} from 'react';
import {useState, useEffect, useRef} from 'react';

type IntersectionOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

const useInView = (
  options: IntersectionOptions = {},
): {inView: boolean; ref: RefObject} => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Update our state when observer callback fires
      setInView(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return {inView: true, ref};
};

export default useInView;
