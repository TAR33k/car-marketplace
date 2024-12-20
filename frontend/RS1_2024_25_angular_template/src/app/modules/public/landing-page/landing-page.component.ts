import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  ChangeDetectionStrategy,
  OnDestroy, ChangeDetectorRef, OnChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelect } from '@angular/material/select';
import {
  CarGetAllResponse,
  CarGetAllRequest, CarGetAllEndpointService
} from '../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import {
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {FuelType, TransmissionType, VehicleCondition} from '../../../services/car-services/car-enums'
import {
  ManufacturerGetAllEndpointService,
  ManufacturerGetAllResponse
} from '../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService, CarModelGetByManufacturerResponse
} from '../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import {Subject, takeUntil} from 'rxjs';
import {Meta, Title} from '@angular/platform-browser';
import {
  AdvertGetFeaturedResponse, AdvertisementGetFeaturedEndpointService, FeaturedType
} from '../../../endpoints/advertisement-endpoints/advertisement-get-featured-endpoint.service';
import {finalize} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {LanguageService} from '../../../services/language.service';

interface BodyTypeWithCount extends BodyTypeGetAllResponse {
  icon: string;
  count: number;
}

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingPageComponent implements OnInit, OnDestroy, OnChanges {
  // ViewChild declarations
  @ViewChild('makeSelect') makeSelect?: MatSelect;
  @ViewChild('modelSelect') modelSelect?: MatSelect;
  @ViewChild('conditionSelect') conditionSelect?: MatSelect;
  @ViewChild('fuelSelect') fuelSelect?: MatSelect;
  @ViewChild('transmissionSelect') transmissionSelect?: MatSelect;

  currentLang: string;

  // Constants
  private readonly INITIAL_DISPLAYED_COUNT = 6;
  private readonly LOAD_MORE_INCREMENT = 6;
  private readonly FEATURED_COUNT = 12;
  readonly currentYear = new Date().getFullYear();

  // Form and Filters
  filterForm: FormGroup;
  priceRange = [0, 200000];
  yearRange = [1990, this.currentYear];

  // Data Collections
  manufacturers: ManufacturerGetAllResponse[] = [];
  makes: string[] = [];
  models: string[] = [];
  bodyTypes: BodyTypeWithCount[] = [];
  featuredAds: AdvertGetFeaturedResponse[] = [];

  // UI State
  loading = false;
  isLoading = true;
  error: string | null = null;
  displayedAds = this.INITIAL_DISPLAYED_COUNT;
  heroBackground = 'assets/images/hero-background.jpg';

  // Carousel State
  currentSlide = 0;
  itemsPerSlide = 4;
  maxSlides = 0;

  // Enums
  readonly FuelType = FuelType;
  readonly TransmissionType = TransmissionType;

  // Options
  readonly fuelTypeOptions = this.getEnumOptions(FuelType);
  readonly transmissionOptions = this.getEnumOptions(TransmissionType);

  private readonly bodyTypeIcons: Record<string, string> = {
    'Sedan': 'directions_car',
    'SUV': 'drive_eta',
    'Hatchback': 'hatchback',
    'Wagon': 'weekend',
    'Coupe': 'sports_car',
    'Convertible': 'convertible',
    'Van': 'airport_shuttle',
    'Pickup': 'local_shipping'
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly manufacturerService: ManufacturerGetAllEndpointService,
    private readonly modelService: CarModelGetByManufacturerEndpointService,
    private readonly bodyTypeService: BodyTypeGetAllEndpointService,
    private readonly carGetAllService: CarGetAllEndpointService,
    private readonly advertisementGetFeaturedService: AdvertisementGetFeaturedEndpointService,
    private readonly cdr: ChangeDetectorRef,
    private readonly title: Title,
    private readonly meta: Meta,
    private languageService: LanguageService,
    private translate: TranslateService
  ) {
    this.initializeSEO();
    this.filterForm = this.initializeForm();
    this.currentLang = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(lang => {
        this.currentLang = lang;
        this.cdr.markForCheck();
      });

    this.initializeData();
    this.setupFormSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  onBodyTypeSelect(bodyTypeId: number): void {
    const currentValue = this.filterForm.get('bodyType')?.value;
    this.filterForm.patchValue({
      bodyType: currentValue === bodyTypeId ? null : bodyTypeId
    });
  }

  applyFilters(): void {
    if (!this.filterForm.valid) return;

    const filters = this.prepareFilters();
    this.router.navigate(['/cars'], { queryParams: filters });
  }

  resetFilters(): void {
    this.filterForm.reset({ condition: 'all' });
    this.priceRange = [0, 200000];
    this.yearRange = [1990, this.currentYear];
    this.models = [];
  }

  // Carousel Methods
  nextSlide(): void {
    const lastPossibleSlide = Math.ceil(this.bodyTypes.length / this.itemsPerSlide) - 1;
    if (this.currentSlide < lastPossibleSlide) {
      this.currentSlide++;
    }
  }

  previousSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  isNextDisabled(): boolean {
    const lastPossibleSlide = Math.ceil(this.bodyTypes.length / this.itemsPerSlide) - 1;
    return this.currentSlide >= lastPossibleSlide;
  }

  getDotArray(): number[] {
    return Array(this.maxSlides).fill(0);
  }

  // Tracking Methods
  trackByAd(index: number, ad: AdvertGetFeaturedResponse): number {
    return ad.id;
  }

  trackByBodyType(index: number, item: BodyTypeWithCount): number {
    return item.id;
  }

  // Host Listeners
  @HostListener('window:resize')
  onResize(): void {
    this.updateItemsPerSlide();
    this.updateMaxSlides();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    if (!element.closest('mat-select') && !element.closest('mat-option')) {
      this.closeAllSelects();
    }
  }

  // Private Methods
  private initializeSEO(): void {
    this.title.setTitle('Find Your Perfect Car | Auto Marketplace');
    this.meta.updateTag({
      name: 'description',
      content: 'Browse our extensive collection of vehicles...'
    });
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      bodyType: [''],
      make: [''],
      model: [{value: '', disabled: true}],
      condition: ['all'],
      fuelType: [''],
      transmission: [''],
      mileageTo: ['']
    });
  }

  private initializeData(): void {
    this.loadManufacturers();
    this.loadBodyTypes();
    this.loadFeaturedAds();
  }

  private setupFormSubscriptions(): void {
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

  // Private Methods (continued)
  private getEnumOptions(enumObj: any) {
    return Object.entries(enumObj)
      .filter(([key, value]) => typeof value === 'number')
      .map(([key, value]) => ({
        value: value as number,
        label: key
      }));
  }

  public loadFeaturedAds(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges(); // Ensure loading state is visible

    const request = {
      featuredType: FeaturedType.Newest,
      count: this.FEATURED_COUNT
    };

    this.advertisementGetFeaturedService.handleAsync(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => { // Type as any temporarily to inspect response
          console.log('Featured Ads Response:', response); // Log the response

          if (Array.isArray(response)) {
            this.featuredAds = response;
          } else if (response?.dataItems) {
            this.featuredAds = response.dataItems;
          } else {
            this.featuredAds = [];
            this.error = 'Invalid response format';
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          this.handleError('Failed to load featured advertisements', error);
          this.featuredAds = [];
          this.cdr.detectChanges();
        }
      });
  }

  private loadBodyTypes(): void {
    this.bodyTypeService.handleAsync().subscribe({
      next: (bodyTypes) => {
        this.bodyTypes = bodyTypes.map(type => ({
          ...type,
          icon: this.bodyTypeIcons[type.name] || 'directions_car',
          count: 0
        }));
        this.updateItemsPerSlide();
        this.updateBodyTypeCounts();
      },
      error: (error) => this.handleError('Error loading body types', error)
    });
  }

  private updateBodyTypeCounts(): void {
    const request: CarGetAllRequest = {
      pageNumber: 1,
      pageSize: 1000
    };

    this.carGetAllService.handleAsync(request).subscribe({
      next: (response: any) => {
        if (!response?.dataItems) {
          return;
        }

        const countMap = this.createBodyTypeCountMap(response.dataItems);
        this.updateBodyTypeCountsAndSort(countMap);
        this.cdr.detectChanges();
      },
      error: (error) => this.handleError('Error updating body type counts', error)
    });
  }

  private createBodyTypeCountMap(cars: CarGetAllResponse[]): Map<number, number> {
    const countMap = new Map<number, number>();

    cars.forEach(car => {
      if (car.bodyTypeName) {
        const bodyType = this.bodyTypes.find(bt => bt.name === car.bodyTypeName);
        if (bodyType) {
          countMap.set(bodyType.id, (countMap.get(bodyType.id) || 0) + 1);
        }
      }
    });

    return countMap;
  }

  private updateBodyTypeCountsAndSort(countMap: Map<number, number>): void {
    this.bodyTypes = this.bodyTypes
      .map(type => ({
        ...type,
        count: countMap.get(type.id) || 0
      }))
      .sort((a, b) => b.count - a.count);

    this.cdr.detectChanges();
  }

  private loadManufacturers(): void {
    this.loading = true;

    this.manufacturerService.handleAsync()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (manufacturers) => {
          this.manufacturers = manufacturers;
          this.makes = manufacturers.map(m => m.name);
        },
        error: (error) => this.handleError('Error loading manufacturers', error)
      });
  }

  private loadModels(manufacturerName: string): void {
    this.loading = true;
    const manufacturer = this.manufacturers.find(m => m.name === manufacturerName);

    if (!manufacturer) {
      this.models = [];
      this.loading = false;
      return;
    }

    this.modelService.handleAsync(manufacturer.id)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (models: CarModelGetByManufacturerResponse[]) => {
          this.models = models.map(m => m.name);
        },
        error: (error) => this.handleError('Error loading models', error)
      });
  }

  private updateItemsPerSlide(): void {
    const width = window.innerWidth;
    this.itemsPerSlide = width < 600 ? 1
      : width < 960 ? 2
        : width < 1280 ? 3
          : 4;

    this.updateMaxSlides();
  }

  private updateMaxSlides(): void {
    const totalItems = this.bodyTypes.length;
    this.maxSlides = Math.ceil(totalItems / this.itemsPerSlide);

    if (this.currentSlide >= this.maxSlides) {
      this.goToSlide(Math.max(0, this.maxSlides - 1));
    }
  }

  private closeAllSelects(): void {
    [
      this.makeSelect,
      this.modelSelect,
      this.conditionSelect,
      this.fuelSelect,
      this.transmissionSelect
    ].forEach(select => select?.close());
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.error = this.translate.instant('landing.featured.error');
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  getTranslatedCondition(condition: string): string {
    return this.translate.instant(`landing.search.condition.${condition.toLowerCase()}`);
  }

  switchLanguage(lang: string) {
    this.languageService.changeLanguage(lang);
  }

  private prepareFilters(): Record<string, any> {
    const filters = {
      ...this.filterForm.value,
      priceFrom: this.priceRange[0],
      priceTo: this.priceRange[1],
      yearFrom: this.yearRange[0],
      yearTo: this.yearRange[1]
    };

    // Remove empty values
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value != null && value !== '')
    );
  }

  // Public Getters
  get visibleAds(): AdvertGetFeaturedResponse[] {
    return this.featuredAds.slice(0, this.displayedAds);
  }

  loadMore(): void {
    this.displayedAds = Math.min(
      this.displayedAds + this.LOAD_MORE_INCREMENT,
      this.featuredAds.length
    );
  }

  protected readonly HTMLImageElement = HTMLImageElement;
  protected readonly VehicleCondition = VehicleCondition;

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.hidden = true;
  }
}
