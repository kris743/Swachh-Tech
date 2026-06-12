'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function MapPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  // Default to central coordinates (e.g., center of a city)
  const defaultCenter: [number, number] = [28.6139, 77.2090]; // New Delhi

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1]);
    }
  }, [position, onLocationSelect]);

  // Component to handle map flyTo and auto-locate
  function MapController() {
    const map = useMap();
    
    useEffect(() => {
      // Small trick to expose the map instance to the parent component for the button click
      (window as any).flyToLocation = (lat: number, lng: number) => {
        map.flyTo([lat, lng], 16, { animate: true });
      };
      return () => {
        delete (window as any).flyToLocation;
      }
    }, [map]);
    return null;
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        if ((window as any).flyToLocation) {
          (window as any).flyToLocation(latitude, longitude);
        }
      },
      (err) => {
        console.error(err);
        alert('Could not fetch location. Please allow location permissions in your browser.');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-border z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <button 
        type="button"
        onClick={handleGetCurrentLocation}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black text-sm font-bold px-4 py-2 rounded-full shadow-lg border border-border hover:bg-muted/50 transition-colors z-[1000] flex items-center gap-2"
      >
        📍 Use Current Location
      </button>
    </div>
  );
}

