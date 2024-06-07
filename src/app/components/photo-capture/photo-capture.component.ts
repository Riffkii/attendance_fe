import { Component, EventEmitter, Output } from '@angular/core';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'photo-capture',
  templateUrl: './photo-capture.component.html',
  styleUrl: './photo-capture.component.scss',
})
export class PhotoCaptureComponent {
  public showWebcam: boolean = true;
  public webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();

  @Output() capturedImage = new EventEmitter<WebcamImage>();

  public triggerSnapshot(): void {
    this.trigger.next();
    this.showWebcam = false;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.flip(webcamImage.imageAsDataUrl).then((flippedImageUrl) => {
      this.dataURLToImageData(flippedImageUrl).then((imageData) => {
        if (imageData) {
          this.webcamImage = new WebcamImage(
            flippedImageUrl,
            'image/png',
            imageData
          );
          this.showWebcam = false;
          this.capturedImage.emit(this.webcamImage);
        } else {
          console.error('Failed to get image data');
        }
      });
    });
  }

  private flip(src: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.scale(-1, 1);
          ctx.drawImage(img, -img.width, 0);
          resolve(c.toDataURL());
        } else {
          reject('Could not get 2D context');
        }
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  private dataURLToImageData(dataURL: string): Promise<ImageData | null> {
    return new Promise<ImageData | null>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        const ctx = c.getContext('2d');
        if (ctx) {
          c.width = img.width;
          c.height = img.height;
          ctx.drawImage(img, 0, 0);
          resolve(ctx.getImageData(0, 0, img.width, img.height));
        } else {
          reject('Could not get 2D context');
        }
      };
      img.onerror = () => reject(null);
      img.src = dataURL;
    });
  }

  public uploadImage(): void {
    if (this.webcamImage) {
      const formData = new FormData();
      const blob = this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
      formData.append('image', blob, 'webcam-image.png');
    }
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }
}
