export default function FloatingBg() {
  return (
    <div className="wallpaper-bg">
      <video
        autoPlay
        loop
        muted
        playsInline
        src={`${import.meta.env.BASE_URL}wallpaper.mp4`}
      />
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
          width: auto;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
}
