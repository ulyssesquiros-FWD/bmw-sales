import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function VehicleGalleryViewer({ views = [], title = 'Vehículo BMW' }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [views]);

  if (!views || views.length === 0) return null;

  const safeIndex = activeIndex < views.length ? activeIndex : 0;
  const currentView = views[safeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? views.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === views.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gallery-stage-wrapper">
      <div className="gallery-main-canvas">
        <img
          src={currentView.url}
          alt={`${title} — ${currentView.label}`}
        />

        {views.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-arrow prev"
              onClick={handlePrev}
              aria-label="Vista anterior"
              title="Vista anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="gallery-nav-arrow next"
              onClick={handleNext}
              aria-label="Siguiente vista"
              title="Siguiente vista"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        <div className="gallery-caption-overlay">
          Vista {safeIndex + 1}/{views.length}: {currentView.label}
        </div>
      </div>

      {views.length > 1 && (
        <div className="gallery-thumbs-strip">
          {views.map((view, idx) => (
            <button
              key={`${view.id}-${idx}`}
              type="button"
              className={`gallery-thumb-btn ${idx === safeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <img src={view.url} alt={view.label} loading="lazy" />
              <span className="gallery-thumb-label">{view.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

