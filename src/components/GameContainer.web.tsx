import { useEffect, useRef } from 'react';

interface Props {
  onMessage?: (data: string) => void;
}

export default function GameContainer({ onMessage }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.source === iframeRef.current?.contentWindow) {
        onMessage?.(
          typeof event.data === 'string' ? event.data : JSON.stringify(event.data)
        );
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMessage]);

  return (
    <iframe
      ref={iframeRef}
      src="/game/index.html"
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        border: 'none',
        backgroundColor: '#060a12',
        display: 'block',
      }}
      allow="autoplay"
    />
  );
}