import { Component, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-gallery-dialog',
  template: `
    <div class="gallery-dialog">
      <button mat-icon-button class="close-button" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>

      <div class="main-image" [class.zoomed]="isZoomed" (click)="toggleZoom($event)">
        <button mat-icon-button class="nav-button prev"
                (click)="previousImage($event)"
                [disabled]="currentIndex === 0"
                *ngIf="!isZoomed">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <div class="image-container"
             [class.zoomed]="isZoomed"
             (mousemove)="handleMouseMove($event)"
             #imageContainer>
          <img [src]="images[currentIndex].imageUrl"
               [alt]="title"
               [style.transform]="getImageTransform()">
        </div>

        <button mat-icon-button class="nav-button next"
                (click)="nextImage($event)"
                [disabled]="currentIndex === images.length - 1"
                *ngIf="!isZoomed">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <div class="thumbnail-strip" *ngIf="!isZoomed">
        <div class="thumbnail"
             *ngFor="let image of images; let i = index"
             [class.active]="i === currentIndex"
             (click)="currentIndex = i">
          <img [src]="image.imageUrl" [alt]="title">
        </div>
      </div>

      <div class="counter" *ngIf="!isZoomed">
        {{currentIndex + 1}} / {{images.length}}
      </div>

      <div class="zoom-instructions" *ngIf="isZoomed">
        <mat-icon>zoom_out</mat-icon>
        Click to exit zoom
      </div>
    </div>
  `,
  styles: [`
    .gallery-dialog {
      background: rgba(0,0,0,0.95);
      position: relative;
      height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }

    .close-button {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 10;
      color: white;
    }

    .main-image {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: zoom-in;
      background: rgba(0,0,0,0.95);

      &.zoomed {
        cursor: zoom-out;
      }
    }

    .image-container {
      height: 80vh;
      width: 90%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      &.zoomed {
        height: 100vh;
        width: 100%;
      }

      img {
        max-height: 100%;
        max-width: 100%;
        object-fit: contain;
        transition: transform 0.1s ease-out;
      }
    }

    .nav-button {
      position: absolute;
      color: white;
      background: rgba(255,255,255,0.1);

      &.prev { left: 20px; }
      &.next { right: 20px; }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .thumbnail-strip {
      display: flex;
      gap: 8px;
      padding: 20px;
      overflow-x: auto;

      .thumbnail {
        width: 80px;
        height: 60px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.3s;

        &.active {
          opacity: 1;
          border: 2px solid #ff5722;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .counter {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      background: rgba(0,0,0,0.5);
      padding: 4px 12px;
      border-radius: 12px;
    }

    .zoom-instructions {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0,0,0,0.5);
      padding: 8px 16px;
      border-radius: 20px;
    }
  `]
})
export class ImageGalleryDialogComponent {
  images: any[];
  title: string;
  currentIndex: number;
  isZoomed = false;
  mouseX = 0;
  mouseY = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { images: any[], title: string, startIndex: number },
    public dialogRef: MatDialogRef<ImageGalleryDialogComponent>
  ) {
    this.images = data.images;
    this.title = data.title;
    this.currentIndex = data.startIndex;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isZoomed) return;

    if (event.key === 'ArrowLeft') {
      this.previousImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  previousImage(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextImage(event?: MouseEvent) {
    if (event) event.stopPropagation();
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
    }
  }

  toggleZoom(event: MouseEvent) {
    this.isZoomed = !this.isZoomed;
    if (this.isZoomed) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
  }

  handleMouseMove(event: MouseEvent) {
    if (this.isZoomed) {
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
    }
  }

  getImageTransform(): string {
    if (!this.isZoomed) return 'none';

    const x = (window.innerWidth / 2 - this.mouseX) * 0.3;
    const y = (window.innerHeight / 2 - this.mouseY) * 0.3;

    return `scale(2) translate(${x}px, ${y}px)`;
  }

  close() {
    this.dialogRef.close(this.currentIndex);
  }
}
