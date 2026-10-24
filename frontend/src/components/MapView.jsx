import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const customIcons = {
  destination: L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: 'custom-marker destination-marker',
  }),
  activity: L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [20, 34],
    iconAnchor: [10, 34],
    popupAnchor: [1, -28],
    className: 'custom-marker activity-marker',
  }),
  accommodation: L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [20, 34],
    iconAnchor: [10, 34],
    popupAnchor: [1, -28],
    className: 'custom-marker accommodation-marker',
  }),
}

function MapComponent({ mapData }) {
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (mapRef.current && mapData?.markers?.length) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [mapData])

  if (!mapData?.center || !mapData?.markers?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center p-4 text-gray-500">
          <p className="font-medium">Map unavailable</p>
          <p className="text-sm mt-1">{mapData?.note || 'No location data available for this trip'}</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      ref={mapRef}
      center={mapData.center}
      zoom={mapData.zoom || 12}
      className="w-full h-full"
      scrollWheelZoom={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mapData.markers.map((marker, index) => (
        <Marker
          key={`${marker.type}-${index}`}
          position={[marker.latitude, marker.longitude]}
          icon={customIcons[marker.type] || customIcons.activity}
        >
          <Popup>
            <div className="p-1 min-w-[200px]">
              <h4 className="font-semibold text-gray-900">{marker.name}</h4>
              {marker.description && <p className="text-sm text-gray-600 mt-1">{marker.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                {marker.day && <span>Day {marker.day}</span>}
                {marker.time && <span>{marker.time}</span>}
                {marker.estimated_cost && <span>${marker.estimated_cost}</span>}
                {marker.category && <span className="capitalize">{marker.category}</span>}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export function MapView({ mapData }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapComponent mapData={mapData} />
    </div>
  )
}