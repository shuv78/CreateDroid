import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, useAuth } from '../App';
import { supabase } from '../db/supabase';

const slides = [
  {
    id: 1,
    icon: '🚀',
    title: 'Welcome to AppFullStack',
    subtitle: 'Powerful full-stack mobile apps with Capacitor & Supabase',
  },
  {
    id: 2,
    icon: '⚡',
    title: 'Real-time Everything',
    subtitle: 'Live updates, instant sync, and offline support built-in',
  },
  {
    id: 3,
    icon: '🔒',
    title: 'Secure & Scalable',
    subtitle: 'Authentication, row-level security, and enterprise-grade infrastructure',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [animating, setAnimating] = useState(false);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, []);

  const goToSlide = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setAnimating(false), 400);
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
    }, 4000);
  }, [animating]);

  const handleSkip = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleGetStarted = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    const diff = touchStart - touchEnd;
    if (diff > 50 && currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else if (diff < -50 && currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const mutedColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: bg,
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px' }}>
        <button
          onClick={handleSkip}
          style={{
            background: 'transparent',
            border: 'none',
            color: mutedColor,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          transition: 'opacity 0.4s ease, transform 0.4s ease',
        }}
      >
        <div style={{ fontSize: '80px', marginBottom: '32px', animation: 'float 3s ease-in-out infinite' }}>
          {slide.icon}
        </div>
        <h1
          key={slide.id}
          style={{
            fontSize: '28px',
            fontWeight: 700,
            textAlign: 'center',
            margin: '0 0 12px',
            lineHeight: 1.3,
          }}
        >
          {slide.title}
        </h1>
        <p
          style={{
            fontSize: '16px',
            textAlign: 'center',
            color: mutedColor,
            margin: 0,
            maxWidth: '300px',
            lineHeight: 1.5,
          }}
        >
          {slide.subtitle}
        </p>
      </div>

      {/* Dots + CTA */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              style={{
                width: i === currentSlide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                background: i === currentSlide ? '#7c3aed' : mutedColor,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA */}
        {currentSlide === slides.length - 1 ? (
          <button
            onClick={handleGetStarted}
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '16px 32px',
              borderRadius: '14px',
              border: 'none',
              background: '#7c3aed',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            }}
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={() => goToSlide(currentSlide + 1)}
            style={{
              width: '100%',
              maxWidth: '320px',
              padding: '14px 32px',
              borderRadius: '14px',
              border: '1px solid rgba(124,58,237,0.3)',
              background: 'transparent',
              color: '#7c3aed',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Next
          </button>
        )}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
