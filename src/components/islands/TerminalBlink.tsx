import { useState, useEffect } from 'react';

export default function TerminalBlink() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block h-[0.9em] w-[0.5em] translate-y-[0.05em] bg-accent transition-opacity duration-100 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
