import { useRef, useEffect } from 'react';

export default function FloatingBg() {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('webkit-playsinline', '');
      v.load();
      v.play().catch(() => {
        // 如果自动播放被拦，等用户第一次触摸后再播
        const play = () => {
          v.play();
          document.removeEventListener('touchstart', play);
        };
        document.addEventListener('touchstart', play);
      });
    }
  }, []);

  return (
    <div className="wallpaper-bg">
      <video ref={videoRef} poster="" preload="auto">
        <source src={`${import.meta.env.BASE_URL}wallpaper.mp4`} type="video/mp4" />
      </video>
      <style>{`
        .wallpaper-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }
        .wallpaper-bg video {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
