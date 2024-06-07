import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Employee } from '../../models/Employee';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeeService } from '../../services/employee/employee-service.service';
import { PresenceType } from '../../models/PresenceType';
import { PresenceService } from '../../services/presence/presence-service.service';
import { WebcamImage } from 'ngx-webcam';
import { MapPickerComponent } from '../map-picker/map-picker.component';
import L from 'leaflet';

@Component({
  selector: 'check-in',
  templateUrl: './check-in.component.html',
  styleUrl: './check-in.component.scss',
})
export class CheckInComponent {
  form: FormGroup;
  employees$: Observable<Employee[]> | undefined;
  employee: Employee | undefined;
  cios: PresenceType[] = [
    { id: 0, type: 'check in' },
    { id: 2, type: 'permission' },
    { id: 3, type: 'sick' },
  ];
  public webcamImage: WebcamImage | null = null;
  cio: PresenceType | undefined;
  latitude!: number;
  longitude!: number;

  @ViewChild(MapPickerComponent) mapPicker!: MapPickerComponent;

  onCoordinatesSelected(coordinates: { lat: number; lng: number }): void {
    this.latitude = coordinates.lat;
    this.longitude = coordinates.lng;
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        if (this.mapPicker && this.mapPicker['map']) {
          this.mapPicker['map'].setView([this.latitude, this.longitude], 13);

          this.mapPicker.setMarker(new L.LatLng(this.latitude, this.longitude));
        }
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  constructor(
    fb: FormBuilder,
    private dialogRef: MatDialogRef<CheckInComponent>,
    private employeeService: EmployeeService,
    private presenceService: PresenceService,
    private elementRef: ElementRef
  ) {
    this.form = fb.group({
      name: [''],
      cio: [this.cios[0]],
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const inputElement: HTMLInputElement | null =
        this.elementRef.nativeElement.querySelector('input');
      if (inputElement) {
        inputElement.focus();
      }
    });
  }

  onInputChange(event: any): void {
    const value = (event.target as HTMLInputElement).value;
    this.employees$ = this.employeeService.getEmployees(value);
  }

  onOptionSelected(event: any): void {
    const selectedName = event.option.value;
    this.employees$!.subscribe((employees) => {
      this.employee = employees.find((emp) => emp.name === selectedName);
    });
  }

  onCioSelectionChange(event: any): void {
    const selectedCio = event.value;
    this.cio = selectedCio;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSaveClick(): void {
    const formData = new FormData();
    if (this.employee && this.webcamImage && this.cio) {
      formData.append('nik', this.employee.nik);
      formData.append('name', this.employee.name);
      formData.append('presence_type', this.cio.id.toString());
      formData.append('latitude', this.latitude.toString());
      formData.append('longitude', this.longitude.toString());

      this.convertWebcamImageToPng(this.webcamImage)
        .then((file) => {
          formData.append('file', file);

          this.presenceService.addPresence(formData).subscribe(() => {
            this.dialogRef.close();
          });
        })
        .catch((error) => {
          console.error('Failed to convert image:', error);
        });
    }
  }

  receiveData(data: WebcamImage) {
    this.webcamImage = data;
  }

  convertWebcamImageToPng(webcamImage: WebcamImage): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        reject(new Error('Failed to create canvas context'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');

        const blob = this.dataURItoBlob(dataUrl);

        const file = new File([blob], 'webcam_image.png', {
          type: 'image/png',
        });

        resolve(file);
      };

      img.onerror = (error) => {
        reject(new Error('Failed to load image'));
      };

      img.src = webcamImage.imageAsDataUrl;
    });
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab]);
  }
}
