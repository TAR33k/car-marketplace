import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../../services/car-services/car.service';
import { MatSelect } from '@angular/material/select';
import {
  CarGetAllResponse,
  CarGetAllEndpointService,
  CarGetAllRequest
} from '../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import {
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {MyPagedList} from '../../../helper/my-paged-request';
import {FuelType, TransmissionType} from '../../../services/car-services/car-enums'
import {
  ManufacturerGetAllEndpointService,
  ManufacturerGetAllResponse
} from '../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService, CarModelGetByManufacturerResponse
} from '../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import {Subject, takeUntil} from 'rxjs';

interface BodyTypeWithCount extends BodyTypeGetAllResponse {
  icon: string;
  count: number;
}

interface ExtendedCarResponse extends CarGetAllResponse {
  primaryImageUrl?: string;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  // ViewChild declarations
  @ViewChild('makeSelect') makeSelect?: MatSelect;
  @ViewChild('modelSelect') modelSelect?: MatSelect;
  @ViewChild('conditionSelect') conditionSelect?: MatSelect;
  @ViewChild('fuelSelect') fuelSelect?: MatSelect;
  @ViewChild('transmissionSelect') transmissionSelect?: MatSelect;

  filterForm!: FormGroup;
  loading = false;
  currentYear = new Date().getFullYear();

  // Range slider values
  priceRange = [0, 200000];
  yearRange = [1990, this.currentYear];

  manufacturers: ManufacturerGetAllResponse[] = [];
  makes: string[] = [];
  models: string[] = [];
  bodyTypes: BodyTypeWithCount[] = [];

  readonly FuelType = FuelType;
  readonly TransmissionType = TransmissionType;

  featuredCars: ExtendedCarResponse[] = [];
  isLoading = true;
  error: string | null = null;
  displayedCars = 6;
  maxCategories = 0;

  // Carousel properties
  currentSlide = 0;
  slideWidth = 280; // Width of each card + margin
  itemsPerSlide = 4; // Number of items visible at once
  maxSlides = 0;

  private readonly bodyTypeIcons: { [key: string]: string } = {
    'Sedan': 'directions_car',
    'SUV': 'drive_eta',
    'Hatchback': 'hatchback',
    'Wagon': 'weekend',
    'Coupe': 'sports_car',  // or 'directions_car'
    'Convertible': 'convertible',
    'Van': 'airport_shuttle',
    'Pickup': 'local_shipping'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private carGetAllService: CarGetAllEndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService
  ) {
    this.initializeForm();
  }

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadManufacturers();
    this.loadBodyTypes();
    this.loadCars();

    this.filterForm.get('make')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(make => {
      if (make) {
        this.loadModels(make);
      } else {
        this.models = [];
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fuelTypeOptions = Object.entries(FuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  transmissionOptions = Object.entries(TransmissionType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  private loadBodyTypes() {
    this.bodyTypeService.handleAsync().subscribe({
      next: (bodyTypes) => {
        this.maxCategories = bodyTypes.length;
        this.bodyTypes = bodyTypes.map(type => ({
          ...type,
          icon: this.bodyTypeIcons[type.name] || 'directions_car',
          count: 0
        }));
        this.updateItemsPerSlide();
        this.updateBodyTypeCounts();
      },
      error: (error) => {
        console.error('Error loading body types:', error);
      }
    });
  }

  private updateBodyTypeCounts() {
    const request: CarGetAllRequest = {
      pageNumber: 1,
      pageSize: 1000
    };

    this.carGetAllService.handleAsync(request).subscribe({
      next: (response: any) => {
        if (response && response.dataItems) {
          const transformedResponse: MyPagedList<CarGetAllResponse> = {
            data: response.dataItems,
            totalCount: response.totalCount,
            pageSize: response.pageSize,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious
          };

          const countMap = new Map<number, number>();

          transformedResponse.data.forEach((car: CarGetAllResponse) => {
            if (car.bodyTypeName) {
              const bodyType = this.bodyTypes.find(bt => bt.name === car.bodyTypeName);
              if (bodyType) {
                const count = countMap.get(bodyType.id) || 0;
                countMap.set(bodyType.id, count + 1);
              }
            }
          });

          // Update counts and sort by count in descending order
          this.bodyTypes = this.bodyTypes
            .map(type => ({
              ...type,
              count: countMap.get(type.id) || 0
            }))
            .sort((a, b) => b.count - a.count); // Sort in descending order

          console.log('Sorted body types:', this.bodyTypes);
        }
      },
      error: (error) => {
        console.error('Error updating body type counts:', error);
      }
    });
  }

  onBodyTypeSelect(bodyTypeId: number) {
    const currentBodyType = this.filterForm.get('bodyType')?.value;
    this.filterForm.patchValue({
      bodyType: currentBodyType === bodyTypeId ? null : bodyTypeId
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    const isSelect = clickedElement.closest('mat-select');
    const isOption = clickedElement.closest('mat-option');

    if (!isSelect && !isOption) {
      // Close all select dropdowns
      this.makeSelect?.close();
      this.modelSelect?.close();
      this.conditionSelect?.close();
      this.fuelSelect?.close();
      this.transmissionSelect?.close();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateItemsPerSlide();
    this.updateMaxSlides();
  }

  private updateItemsPerSlide() {
    const width = window.innerWidth;
    if (width < 600) {
      this.itemsPerSlide = 1;
    } else if (width < 960) {
      this.itemsPerSlide = 2;
    } else if (width < 1280) {
      this.itemsPerSlide = 3;
    } else {
      this.itemsPerSlide = 4;
    }
    this.updateMaxSlides();
  }

  private updateMaxSlides() {
    // Calculate how many slides we need to show all items
    const totalItems = this.bodyTypes.length;
    this.maxSlides = Math.ceil(totalItems / this.itemsPerSlide);

    // Ensure currentSlide is within bounds
    if (this.currentSlide >= this.maxSlides) {
      this.goToSlide(this.maxSlides - 1);
    }
  }

  nextSlide() {
    const lastPossibleSlide = Math.ceil(this.bodyTypes.length / this.itemsPerSlide) - 1;
    if (this.currentSlide < lastPossibleSlide) {
      this.currentSlide++;
    }
  }

  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  getDotArray(): number[] {
    return Array(this.maxSlides).fill(0);
  }

  // Calculate if next button should be disabled
  isNextDisabled(): boolean {
    const lastPossibleSlide = Math.ceil(this.bodyTypes.length / this.itemsPerSlide) - 1;
    return this.currentSlide >= lastPossibleSlide;
  }

  // Calculate visible items for current slide
  getVisibleItems(): BodyTypeWithCount[] {
    const startIndex = this.currentSlide * this.itemsPerSlide;
    return this.bodyTypes.slice(startIndex, startIndex + this.itemsPerSlide);
  }

  private initializeForm() {
    this.filterForm = this.fb.group({
      bodyType: [''],
      make: [''],
      model: [''],
      condition: ['all'],
      fuelType: [''],
      transmission: [''],
      mileageTo: ['']
    });
  }

  private loadManufacturers() {
    this.loading = true;
    this.manufacturerService.handleAsync().subscribe({
      next: (manufacturers) => {
        this.manufacturers = manufacturers;
        this.makes = manufacturers.map(m => m.name);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading manufacturers:', error);
        this.loading = false;
      }
    });
  }

  private loadModels(manufacturerName: string) {
    this.loading = true;
    const manufacturer = this.manufacturers.find(m => m.name === manufacturerName);

    if (manufacturer) {
      this.modelService.handleAsync(manufacturer.id).subscribe({
        next: (models: CarModelGetByManufacturerResponse[]) => {
          this.models = models.map(m => m.name);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading models:', error);
          this.loading = false;
        }
      });
    } else {
      this.models = [];
      this.loading = false;
    }
  }

  protected loadCars() {
    this.isLoading = true;
    this.error = null;

    const request: CarGetAllRequest = {
      pageNumber: 1,
      pageSize: 12
    };

    this.carGetAllService.handleAsync(request).subscribe({
      next: (response: any) => {  // Use any temporarily to handle the response
        if (response && response.dataItems) {
          // Transform the response to match our interface
          const transformedResponse: MyPagedList<CarGetAllResponse> = {
            data: response.dataItems,
            totalCount: response.totalCount,
            pageSize: response.pageSize,
            currentPage: response.currentPage,
            totalPages: response.totalPages,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious
          };

          this.featuredCars = transformedResponse.data;
          console.log('Loaded cars:', this.featuredCars);
        } else {
          this.featuredCars = [];
          this.error = 'No cars found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.error = 'Failed to load cars. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  getEnumLabel(enumObj: any, value: number): string {
    return Object.entries(enumObj)
      .find(([key, val]) => val === value)?.[0] || '';
  }

  get visibleCars(): CarGetAllResponse[] {
    return this.featuredCars.slice(0, this.displayedCars);
  }

  loadMore() {
    this.displayedCars = Math.min(this.displayedCars + 6, this.featuredCars.length);
  }

  formatPriceLabel(value: number): string {
    return `${value.toLocaleString()} €`;
  }

  formatYearLabel(value: number): string {
    return value.toString();
  }

  applyFilters() {
    if (this.filterForm.valid) {
      const filters = {
        ...this.filterForm.value,
        priceFrom: this.priceRange[0],
        priceTo: this.priceRange[1],
        yearFrom: this.yearRange[0],
        yearTo: this.yearRange[1]
      };

      // Remove empty values
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          delete filters[key];
        }
      });

      this.router.navigate(['/cars'], {
        queryParams: filters
      });
    }
  }

// Update the resetFilters method
  resetFilters() {
    this.filterForm.reset({
      condition: 'all'
    });
    this.priceRange = [0, 200000];
    this.yearRange = [1990, this.currentYear];
    this.models = [];
  }
}
