import { useState, useEffect } from 'react';
export function useMaps(apiKey) {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      document.head.appendChild(script);
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => { setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        e => setError(e.message)
      );
    }
  }, [apiKey]);
  const initMap = (elementId, center = { lat: 23.685, lng: 90.3563 }, zoom = 12) => {
    if (window.google) {
      const m = new window.google.maps.Map(document.getElementById(elementId), { center, zoom });
      setMap(m);
      return m;
    }
  };
  const addMarker = (m, latlng, title = 'Marker') => {
    if (window.google) return new window.google.maps.Marker({ position: latlng, map: m, title });
  };
  return { map, position, error, initMap, addMarker };
}