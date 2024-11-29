import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../../services/car-services/car.service';
import { MatSelect } from '@angular/material/select';
import {CarGetAllResponse, CarGetAllService} from '../../../endpoints/car-endpoints/car-get-all-endpoint.service';

interface BodyType {
  id: string;
  name: string;
  icon: string;
  count: number;
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

  displayedCars = 6;
  featuredCars: CarGetAllResponse[] = [];
  isLoading = true;
  error: string | null = null;

  bodyTypes: BodyType[] = [
    { id: 'sedan', name: 'Sedan', icon: 'directions_car', count: 1234 },
    { id: 'suv', name: 'SUV', icon: 'directions_car', count: 2345 },
    { id: 'hatchback', name: 'Hatchback', icon: 'directions_car', count: 890 },
    { id: 'wagon', name: 'Wagon', icon: 'directions_car', count: 567 },
    { id: 'coupe', name: 'Coupe', icon: 'directions_car', count: 345 },
    { id: 'convertible', name: 'Convertible', icon: 'directions_car', count: 123 },
    { id: 'van', name: 'Van', icon: 'airport_shuttle', count: 456 },
    { id: 'pickup', name: 'Pickup', icon: 'local_shipping', count: 234 }
  ];

  makes: string[] = [];
  models: string[] = [];

  fuelTypes = [
    'Petrol',
    'Diesel',
    'Electric',
    'Hybrid',
    'Plug-in Hybrid'
  ];

  transmissions = [
    'Manual',
    'Automatic'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private carService: CarService,
    private carService1: CarGetAllService,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadMakes();
    this.loadCars();

    this.filterForm.get('make')?.valueChanges.subscribe(make => {
      if (make) {
        this.loadModels(make);
      } else {
        this.models = [];
      }
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

  private loadMakes() {
    this.loading = true;
    this.carService.getCarMakes().subscribe({
      next: (makes) => {
        this.makes = makes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading makes:', error);
        this.loading = false;
      }
    });
  }

  protected loadCars() {
    this.isLoading = true;
    this.carService1.handleAsync().subscribe({
      next: (cars) => {
        this.featuredCars = cars;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.error = 'Failed to load cars. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadMore() {
    this.displayedCars += 6;
  }

  get visibleCars() {
    return this.featuredCars.slice(0, this.displayedCars);
  }

  private loadModels(make: string) {
    this.loading = true;
    this.carService.getCarModels(make).subscribe({
      next: (models) => {
        this.models = models;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading models:', error);
        this.loading = false;
      }
    });
  }

  onBodyTypeSelect(bodyType: string) {
    const currentBodyType = this.filterForm.get('bodyType')?.value;
    // Toggle selection if clicking the same type
    this.filterForm.patchValue({
      bodyType: currentBodyType === bodyType ? '' : bodyType
    });
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
