'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom icon for the garbage truck
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3256/3256094.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default function TruckMap() {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([19.0760, 72.8777]); // Mumbai base
  const [hasLocation, setHasLocation] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto request location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setHasLocation(true);
        },
        (err) => console.log('Location permission denied or failed:', err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  if (!mounted) return <div className="w-full h-full bg-muted/50 animate-pulse rounded-xl" />;

  // Component to fly to new location when found
  function LocationFlyer({ pos }: { pos: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      if (hasLocation) map.flyTo(pos, 15, { animate: true });
    }, [pos, map]);
    return null;
  }

  // Simulated truck nearby (offset slightly from citizen's location)
  const truckPosition: [number, number] = [position[0] + 0.0040, position[1] + 0.0023]; 

  return (
    <MapContainer 
      center={position} 
      zoom={14} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 1 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <LocationFlyer pos={position} />
      <Marker position={truckPosition} icon={truckIcon}>
        <Popup>
          <div className="font-bold text-primary">Truck MH-04-1234</div>
          <div className="text-sm">Status: Active Collection</div>
        </Popup>
      </Marker>
      <Marker position={position}>
        <Popup>
          <div className="font-bold">Your Location</div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
