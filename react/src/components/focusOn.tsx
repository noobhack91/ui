import React, { useEffect, useRef } from 'react';

interface FocusOnProps {
  focusOn: boolean;
}

const FocusOn: React.FC<FocusOnProps> = ({ focusOn }) => {
  const elementRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOn && elementRef.current) {
      elementRef.current.focus();
    }
  }, [focusOn]);

  return <input ref={elementRef} />;
};

export default FocusOn;
