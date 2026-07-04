import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../App';

export default function RateShare() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const appUrl = 'https://appfullstack.dev'; // Replace with actual app store URL
  const appName = 'AppFullStack';

  const handleRate = useCallback(async (stars) => {
    setRating(stars);
    setSubmitted(true);
    try {
      // In production, save rating to Supabase
      // await supabase.from('ratings').insert({ rating: stars, ... });
      // Then redirect to app store
      if (stars >= 4) {
        // Positive rating → encourage store review
        setTimeout(() => {
          const confirmed = window.confirm('Would you like to leave a review on the app store?');
          if (confirmed) {
            window.open(appUrl, '_blank');
          }
        }, 500);
      }
    } catch (err) {
      console.error('Rating submit error:', err);
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const shareData = {
        title: appName,
        text: `Check out ${appName} — a powerful full-stack mobile app!`,
        url: appUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        alert('Link copied to clipboard!');
      } else {
        // Fallback
        prompt('Copy this link to share:', appUrl);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
        // Fallback
        prompt('Copy this link to share:', appUrl);
      }
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
        alert('Link copied to clipboard!');
      } else {
        prompt('Copy this link:', appUrl);
      }
    } catch (err) {
      console.error('Copy error:', err);
      prompt('Copy this link:', appUrl);
    }
  }, []);

  const bg = darkMode ? '#09090b' : '#fafafa';
  const textColor = darkMode ? '#fafafa' : '#09090b';
  const cardBg = darkMode ? '#18181b' : '#ffffff';
  const borderColor = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ minHeight: '100vh', background: bg, color: textColor, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{
        padding: '16px 20px', borderBottom: `1px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', fontSize: '20px' }}>←</button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Rate & Share</h1>
      </header>

      <main style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Rate section */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '32px 20px',
          border: `1px solid ${borderColor}`, textAlign: 'center', marginBottom: '20px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Love this app?</h2>
          <p style={{ fontSize: '14px', opacity: 0.6, margin: '0 0 20px' }}>
            Tap a star to rate {appName}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: '36px', transition: 'transform 0.15s',
                  transform: (hoveredStar || rating) >= star ? 'scale(1.1)' : 'scale(1)',
                  filter: (hoveredStar || rating) >= star ? 'none' : 'grayscale(1)',
                  opacity: (hoveredStar || rating) >= star ? 1 : 0.3,
                  padding: '4px',
                }}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ⭐
              </button>
            ))}
          </div>

          {submitted && rating > 0 && (
            <div style={{
              padding: '10px 16px', borderRadius: '10px',
              background: 'rgba(5,150,105,0.1)', color: '#059669',
              fontSize: '14px',
            }}>
              {rating >= 4
                ? 'Thank you! Your support means the world to us. 🎉'
                : rating >= 3
                  ? 'Thanks for your feedback! We\'re always improving.'
                  : 'We appreciate your honest feedback. We\'ll work to improve!'}
            </div>
          )}
        </div>

        {/* Share section */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '24px 20px',
          border: `1px solid ${borderColor}`, marginBottom: '20px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px' }}>📤 Share the App</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleShare}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: '#7c3aed', color: '#fff', fontSize: '15px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              📱 Share via...
            </button>
            <button
              onClick={handleCopyLink}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                border: `1px solid ${borderColor}`, background: 'transparent',
                color: textColor, fontSize: '15px', fontWeight: 500,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* App info */}
        <div style={{
          background: cardBg, borderRadius: '16px', padding: '20px',
          border: `1px solid ${borderColor}`, textAlign: 'center',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px' }}>{appName}</h3>
          <p style={{ fontSize: '13px', opacity: 0.5, margin: 0 }}>v1.0.0</p>
          <p style={{ fontSize: '12px', opacity: 0.3, margin: '8px 0 0', wordBreak: 'break-all' }}>{appUrl}</p>
        </div>
      </main>
    </div>
  );
}
