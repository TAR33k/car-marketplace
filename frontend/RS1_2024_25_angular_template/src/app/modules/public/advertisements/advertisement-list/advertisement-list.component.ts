import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {FuelType, TransmissionType, VehicleCondition} from '../../../../services/car-services/car-enums';
import { AdvertGetAllRequest, AdvertGetAllResponse, AdvertisementCarFilterEndpointService } from '../../../../endpoints/advertisement-endpoints/advertisement-car-filter-endpoint.service';
import {
  ManufacturerGetAllEndpointService,
  ManufacturerGetAllResponse
} from '../../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService
} from '../../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import {
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';

enum SortOption {
  Newest = 'newest',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
  MostViewed = 'most_viewed'
}

@Component({
  selector: 'app-advertisement-list',
  templateUrl: './advertisement-list.component.html',
  styleUrl: './advertisement-list.component.scss'
})
export class AdvertisementListComponent implements OnInit, OnDestroy, AfterViewInit {
  bodyTypes: BodyTypeGetAllResponse[] = [];
  manufacturers: ManufacturerGetAllResponse[] = [];
  makes: string[] = [];
  models: string[] = [];
  dataSource = new MatTableDataSource<AdvertGetAllResponse>();
  filterForm: FormGroup;
  isLoading = false;
  totalItems = 0;
  pageSize = 20;
  currentPage = 1;
  viewMode: 'grid' | 'list' = 'grid';
  showFilters = true;
  SortOption = SortOption;

  conditionOptions = Object.entries(VehicleCondition)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([key, value]) => ({
      value: Number(key),
      label: value as string
    }));

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private advertisementGetService: AdvertisementCarFilterEndpointService,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.filterForm = this.initializeFilterForm();
  }

  ngOnInit(): void {
    // Load body types
    this.bodyTypeService.handleAsync()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bodyTypes) => {
          this.bodyTypes = bodyTypes;
        },
        error: (error) => {
          console.error('Error loading body types:', error);
        }
      });

    // Load manufacturers first, then handle query params
    this.manufacturerService.handleAsync()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (manufacturers) => {
          this.manufacturers = manufacturers;
          this.makes = manufacturers.map(m => m.name);

          // Setup make/model dependency
          this.setupMakeModelDependency();

          // Now handle query params after manufacturers are loaded
          this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
              if (Object.keys(params).length > 0) {
                this.applyQueryParams(params);
              } else {
                // Fetch advertisements if no query params
                this.fetchAdvertisements();
              }
            });
        },
        error: (error) => {
          console.error('Error loading manufacturers:', error);
          this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
              if (Object.keys(params).length > 0) {
                this.applyQueryParams(params);
              } else {
                // Fetch advertisements if no query params
                this.fetchAdvertisements();
              }
            });
        }
      });

    this.setupFilterSubscription();
  }

  private setupMakeModelDependency(): void {
    // Subscribe to make changes
    this.filterForm.get('make')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged()
      )
      .subscribe(make => {
        // Reset and disable model when make changes
        this.filterForm.patchValue({ model: '' }, { emitEvent: false });
        this.filterForm.get('model')?.disable();
        this.models = [];

        if (make) {
          const manufacturer = this.manufacturers.find(m => m.name === make);
          if (manufacturer) {
            this.isLoading = true;
            this.modelService.handleAsync(manufacturer.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (models) => {
                  this.models = models.map(m => m.name);
                  this.filterForm.get('model')?.enable();
                  this.isLoading = false;
                },
                error: (error) => {
                  console.error('Error loading models:', error);
                  this.isLoading = false;
                }
              });
          }
        }
      });
  }

  clearFilters(): void {
    // Reset the form
    this.filterForm.reset({
      searchTerm: '',
      minPrice: null,
      maxPrice: null,
      condition: null,
      make: '',
      model: { value: '', disabled: true },
      fuelType: null,
      transmission: null,
      yearFrom: null,
      yearTo: null,
      bodyType: null,
      mileageTo: null,
      sortBy: SortOption.Newest
    });

    // Clear models array
    this.models = [];

    // Fetch advertisements with cleared filters
    this.fetchAdvertisements();
  }

  private applyQueryParams(params: any): void {
    const initialModel = params.model || '';

    // Convert condition from string to enum value
    let conditionValue = null;
    if (params.condition) {
      if (params.condition === 'new') {
        conditionValue = VehicleCondition.New;
      } else if (params.condition === 'used') {
        conditionValue = VehicleCondition.Used;
      } else if (params.condition === 'damaged') {
        conditionValue = VehicleCondition.Damaged;
      } else if (params.condition === 'forParts') {
        conditionValue = VehicleCondition.ForParts;
      }
    }

    // Convert fuel type and transmission from string to enum if present
    const fuelType = params.fuelType ? Number(params.fuelType) : null;
    const transmission = params.transmission ? Number(params.transmission) : null;

    const formValues: any = {
      searchTerm: params.searchTerm || '',
      minPrice: params.priceFrom || null,
      maxPrice: params.priceTo || null,
      condition: conditionValue,
      make: params.make || '',
      fuelType: fuelType,
      transmission: transmission,
      yearFrom: params.yearFrom ? Number(params.yearFrom) : null,
      yearTo: params.yearTo ? Number(params.yearTo) : null,
      bodyType: params.bodyTypeId ? Number(params.bodyTypeId) : null,
      mileageTo: params.mileageTo ? Number(params.mileageTo) : null,
      sortBy: params.sortBy || SortOption.Newest
    };

    this.filterForm.patchValue(formValues, { emitEvent: false });

    // If we have a make, load the models and then set the model value
    if (params.make) {
      const manufacturer = this.manufacturers.find(m => m.name === params.make);
      if (manufacturer) {
        this.isLoading = true;
        this.modelService.handleAsync(manufacturer.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (models) => {
              this.models = models.map(m => m.name);
              this.filterForm.get('model')?.enable();

              // Now set the model value if it exists in the available models
              if (initialModel && this.models.includes(initialModel)) {
                this.filterForm.patchValue({ model: initialModel }, { emitEvent: false });
              }

              this.isLoading = false;
              // Trigger search after model is properly set
              this.fetchAdvertisements();
            },
            error: (error) => {
              console.error('Error loading models:', error);
              this.isLoading = false;
              // Still trigger search even if model loading fails
              this.fetchAdvertisements();
            }
          });
      } else {
        this.fetchAdvertisements();
      }
    } else {
      this.fetchAdvertisements();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      minPrice: [null],
      maxPrice: [null],
      condition: [null],
      make: [''],
      model: [{ value: '', disabled: true }],
      fuelType: [null],
      transmission: [null],
      yearFrom: [null],
      yearTo: [null],
      bodyType: [null],
      mileageTo: [null],
      sortBy: [SortOption.Newest]
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.fetchAdvertisements();
      });
  }

  fetchAdvertisements(): void {
    this.isLoading = true;
    const formValues = this.filterForm.value;

    const filters: AdvertGetAllRequest = {
      pageNumber: this.paginator ? this.paginator.pageIndex + 1 : 1,
      pageSize: this.pageSize,
      searchTerm: formValues.searchTerm,
      minPrice: formValues.minPrice,
      maxPrice: formValues.maxPrice,
      condition: formValues.condition,
      make: formValues.make,
      model: formValues.model,
      fuelType: formValues.fuelType,
      transmission: formValues.transmission,
      yearFrom: formValues.yearFrom,
      yearTo: formValues.yearTo,
      bodyTypeId: formValues.bodyType,
      mileageTo: formValues.mileageTo,
      sortBy: formValues.sortBy,
      statusId: 1
    };

    // Remove null/undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof AdvertGetAllRequest] === null ||
        filters[key as keyof AdvertGetAllRequest] === undefined ||
        filters[key as keyof AdvertGetAllRequest] === '') {
        delete filters[key as keyof AdvertGetAllRequest];
      }
    });

    this.advertisementGetService.handleAsync(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.dataItems;
          this.totalItems = response.totalCount;
          this.currentPage = response.pageNumber;
        },
        error: (error) => {
          console.error('Error fetching advertisements:', error);
          this.dataSource.data = [];
          this.totalItems = 0;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/public/advertisements', id]);
  }

  getConditionLabel(condition: VehicleCondition): string {
    return VehicleCondition[condition];
  }

  getFuelTypeLabel(type: FuelType): string {
    return FuelType[type];
  }

  getTransmissionLabel(type: TransmissionType): string {
    return TransmissionType[type];
  }

  readonly fuelTypeOptions = Object.entries(FuelType)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([key, value]) => ({
      value: Number(key),
      label: value as string
    }));

  readonly transmissionOptions = Object.entries(TransmissionType)
    .filter(([key]) => !isNaN(Number(key)))
    .map(([key, value]) => ({
      value: Number(key),
      label: value as string
    }));

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearSearch(event: Event): void {
    event.stopPropagation(); // Prevent event bubbling
    this.filterForm.patchValue({ searchTerm: '' }); // Clear only the search term
  }
}
