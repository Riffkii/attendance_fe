import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'map-picker',
  templateUrl: './map-picker.component.html',
  styleUrl: './map-picker.component.scss',
})
export class MapPickerComponent implements OnInit {
  @Output() coordinatesSelected = new EventEmitter<{
    lat: number;
    lng: number;
  }>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setMarker(e.latlng);
    });
  }

  public setMarker(latlng: L.LatLng): void {
    if (this.map) {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker(latlng).addTo(this.map);
      this.coordinatesSelected.emit({ lat: latlng.lat, lng: latlng.lng });
    }
  }
}
