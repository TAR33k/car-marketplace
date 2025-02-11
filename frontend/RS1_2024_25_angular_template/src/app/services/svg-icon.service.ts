import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BodyTypeIcon } from './body-type-icon.interface';

@Injectable({
  providedIn: 'root'
})
export class SvgIconService {
  private readonly bodyTypeIcons: Record<string, BodyTypeIcon> = {
    'Sedan': {
      name: 'sedan',
      svgPath: 'assets/icons/body-types/sedan.svg',
      viewBox: '0 0 24 24'
    },
    'SUV': {
      name: 'suv',
      svgPath: 'assets/icons/body-types/suv.svg',
      viewBox: '0 0 24 24'
    },
    'Hatchback': {
      name: 'hatchback',
      svgPath: 'assets/icons/body-types/hatchback.svg',
      viewBox: '0 0 24 24'
    },
    'Wagon': {
      name: 'wagon',
      svgPath: 'assets/icons/body-types/wagon.svg',
      viewBox: '0 0 24 24'
    },
    'Coupe': {
      name: 'coupe',
      svgPath: 'assets/icons/body-types/coupe.svg',
      viewBox: '0 0 24 24'
    },
    'Convertible': {
      name: 'convertible',
      svgPath: 'assets/icons/body-types/convertible.svg',
      viewBox: '0 0 24 24'
    },
    'Van': {
      name: 'van',
      svgPath: 'assets/icons/body-types/van.svg',
      viewBox: '0 0 24 24'
    },
    'Pickup': {
      name: 'pickup',
      svgPath: 'assets/icons/body-types/pickup.svg',
      viewBox: '0 0 24 24'
    }
  };

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  registerIcons(): void {
    Object.values(this.bodyTypeIcons).forEach(icon => {
      this.matIconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.svgPath)
      );
    });
  }

  getIconForBodyType(bodyTypeName: string): BodyTypeIcon {
    return this.bodyTypeIcons[bodyTypeName] || this.bodyTypeIcons['Sedan']; // Fallback to sedan
  }
}
