import { Component, OnInit } from '@angular/core';
import {
  CarDeleteEndpointService
} from '../../../../../endpoints/car-endpoints/car-delete-endpoint.service';
import {
  CarGetAllEndpointService,
  CarGetAllResponse,
  CarGetAllRequest
} from '../../../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import { FuelType, TransmissionType } from '../../../../../services/car-services/car-enums';
import Swal from 'sweetalert2';
import {MyPagedList} from '../../../../../helper/my-paged-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})

export class CarListComponent implements OnInit {
  cars: CarGetAllResponse[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Enums for template
  readonly FuelType = FuelType;
  readonly TransmissionType = TransmissionType;

  // Create enum options arrays with proper initialization
  fuelTypeOptions: { value: number; label: string }[] = Object.entries(FuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  transmissionTypeOptions: { value: number; label: string }[] = Object.entries(TransmissionType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  // Filters
  filters: CarGetAllRequest = {
    pageNumber: 1,
    pageSize: 10,
    searchTerm: '',
    manufacturerId: undefined,
    modelId: undefined,
    minYear: undefined,
    maxYear: undefined,
    fuelType: undefined,
    transmission: undefined,
    minMileage: undefined,
    maxMileage: undefined
  };

  constructor(
    private carService: CarGetAllEndpointService,
    private carDeleteService: CarDeleteEndpointService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.carService.handleAsync(this.filters).subscribe({
      next: (response: MyPagedList<CarGetAllResponse>) => {
        console.log('API Response:', response);
        if (response) {
          // Use type assertion to handle the property name difference
          const apiResponse = response as unknown as { dataItems: CarGetAllResponse[] };
          this.cars = apiResponse.dataItems || [];
          this.totalItems = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;

          console.log('Processed cars:', {
            cars: this.cars,
            totalItems: this.totalItems,
            totalPages: this.totalPages,
            currentPage: this.currentPage
          });
        }
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.errorMessage = 'Failed to load cars. Please try again later.';
        this.cars = [];
        this.totalItems = 0;
        this.totalPages = 0;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Update the onPageChange method to use the correct page number
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.filters.pageNumber = page;
      this.loadCars();
    }
  }

  // Update the clearFilters method to reset pagination
  clearFilters(): void {
    this.filters = {
      pageNumber: 1,
      pageSize: this.pageSize,
      searchTerm: '',
      manufacturerId: undefined,
      modelId: undefined,
      minYear: undefined,
      maxYear: undefined,
      fuelType: undefined,
      transmission: undefined,
      minMileage: undefined,
      maxMileage: undefined
    };
    this.currentPage = 1;
    this.loadCars();
  }

  onSearch(): void {
    this.filters.pageNumber = 1; // Reset to first page when searching
    this.loadCars();
  }

  async deleteCar(id: number): Promise<void> {
    // Using SweetAlert2 for better confirmation dialog (optional)
    const result = await Swal.fire({
      title: 'Delete Car',
      text: 'Are you sure you want to delete this car?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      this.isLoading = true;
      this.carDeleteService.handleAsync(id).subscribe({
        next: () => {
          Swal.fire('Deleted!', 'The car has been deleted.', 'success');
          this.loadCars();
        },
        error: (error) => {
          console.error('Error deleting car:', error);
          this.errorMessage = 'Failed to delete car. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }

  // Helper method for pagination range
  getPaginationRange(): number[] {
    const range = 2; // Show 2 pages before and after current page
    let start = Math.max(1, this.currentPage - range);
    let end = Math.min(this.totalPages, this.currentPage + range);

    // Adjust range to always show 5 pages if possible
    if (end - start + 1 < 5) {
      if (start === 1) {
        end = Math.min(5, this.totalPages);
      } else if (end === this.totalPages) {
        start = Math.max(1, this.totalPages - 4);
      }
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }

  getFuelTypeBadgeClass(fuelType: FuelType): string {
    switch (fuelType) {
      case FuelType.Electric:
        return 'bg-success';
      case FuelType.Hybrid:
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  getEnumLabel(enumObj: any, value: number): string {
    return Object.entries(enumObj)
      .find(([key, val]) => val === value)?.[0] || '';
  }

  // Helper method for debounced search
  private searchTimeout: any;
  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 500);
  }

  protected readonly Math = Math;

  editCar(id: number) {
    this.router.navigate(['/admin/cars/edit', id]);
  }
}
