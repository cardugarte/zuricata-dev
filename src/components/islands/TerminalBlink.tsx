import { useState, useEffect } from 'react';

export default function TerminalBlink() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.1em] bg-magenta-dim"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
