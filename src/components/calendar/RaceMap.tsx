import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RaceMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  className?: string;
}

export const RaceMap = ({ latitude, longitude, title, location, className = '' }: RaceMapProps) => {
  const [mapKey, setMapKey] = useState(0);

  // Force re-render when coordinates change
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [latitude, longitude]);

  const position: LatLngExpression = [latitude, longitude];

  return (
    <div className={`relative ${className}`}>
      <MapContainer 
        key={mapKey}
        // @ts-ignore - react-leaflet types issue
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground">{location}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};