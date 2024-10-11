'use client'

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Define an interface for the GPS data point structure
interface GpsDataPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const Map: React.FC = () => {
  const [gpsData, setGpsData] = useState<GpsDataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-gps-data');
        if (!response.ok) {
          throw new Error('Failed to fetch GPS data');
        }
        const data: GpsDataPoint[] = await response.json();
        setGpsData(data);
      } catch (error) {
        console.error('Error fetching GPS data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[0, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {gpsData.map((point, index) => (
        <Marker key={index} position={[point.latitude, point.longitude]}>
          <Popup>
            Lat: {point.latitude}, Lon: {point.longitude}
            <br />
            Time: {new Date(point.timestamp).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;