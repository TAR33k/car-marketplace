import {Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CarDeleteEndpointService } from '../../../../../endpoints/car-endpoints/car-delete-endpoint.service';
import { CarGetAllEndpointService, CarGetAllResponse, CarGetAllRequest } from '../../../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import { FuelType, TransmissionType } from '../../../../../services/car-services/car-enums';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../../../services/notification.service';
import { MyPagedList } from '../../../../../helper/my-paged-request';
import {ViewportScroller} from '@angular/common';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'year', 'engine', 'fuelType', 'transmission', 'mileage', 'color', 'location', 'actions'];
  dataSource = new MatTableDataSource<CarGetAllResponse>();
  filterForm: FormGroup;
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  readonly FuelType = FuelType;
  readonly TransmissionType = TransmissionType;

  fuelTypeOptions = Object.entries(FuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  transmissionTypeOptions = Object.entries(TransmissionType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatPaginator, { read: ElementRef }) paginatorElement!: ElementRef;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private carService: CarGetAllEndpointService,
    private carDeleteService: CarDeleteEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private viewportScroller: ViewportScroller
  ) {
    this.filterForm = this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.setupFilterSubscription();
    this.loadCars();
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 of ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ?
          Math.min(startIndex + pageSize, length) :
          startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} of ${length}`;
      };
    }
  }

  private initializeFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      minYear: [null],
      maxYear: [null],
      fuelType: [null],
      transmission: [null],
      minMileage: [null],
      maxMileage: [null]
    });
  }

  private setupFilterSubscription(): void {
    if (this.filterForm) {
      this.filterForm.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
        )
        .subscribe(() => {
          if (this.paginator) {
            this.paginator.firstPage();
          }
          this.loadCars();
        });
    }
  }

  loadCars(event?: PageEvent): void {
    this.isLoading = true;

    const fuelTypeValue = this.filterForm.get('fuelType')?.value;
    const transmissionValue = this.filterForm.get('transmission')?.value;

    const pageIndex = event?.pageIndex ?? (this.currentPage - 1);
    const pageSize = event?.pageSize ?? this.pageSize;

    const filters: CarGetAllRequest = {
      pageNumber: event?.pageIndex !== undefined ? event.pageIndex + 1 : this.currentPage,
      pageSize: event?.pageSize || this.pageSize,
      searchTerm: this.filterForm.get('searchTerm')?.value || '',
      manufacturerId: undefined,
      modelId: undefined,
      minYear: this.filterForm.get('minYear')?.value || null,
      maxYear: this.filterForm.get('maxYear')?.value || null,
      // Handle enum values specifically
      fuelType: fuelTypeValue === null || fuelTypeValue === undefined ? null : fuelTypeValue,
      transmission: transmissionValue === null || transmissionValue === undefined ? null : transmissionValue,
      minMileage: this.filterForm.get('minMileage')?.value || null,
      maxMileage: this.filterForm.get('maxMileage')?.value || null
    };

    // Modified cleanup to properly handle zero values
    Object.keys(filters).forEach(key => {
      const typedKey = key as keyof CarGetAllRequest;
      const value = filters[typedKey];
      // Only delete if the value is null or undefined, NOT if it's zero
      if (value === undefined || value === null) {
        delete filters[typedKey];
      }
    });

    console.log('Final filters:', filters);

    this.carService.handleAsync(filters).subscribe({
      next: (response: any) => {
        if (response) {
          this.dataSource.data = response.dataItems || [];
          this.totalItems = response.totalCount;
          this.currentPage = response.currentPage;
          this.pageSize = pageSize;

          if (this.paginator) {
            this.paginator.length = this.totalItems;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
          }
        }
      },
      error: (error) => {
        console.error('Error loading cars:', error);
        this.notificationService.notifyUserAction('Error loading cars');
        this.dataSource.data = [];
        this.totalItems = 0;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.loadCars();
  }

  editCar(id: number): void {
    this.router.navigate(['/admin/cars/edit', id]);
  }

  deleteCar(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this car?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.carDeleteService.handleAsync(id).subscribe({
          next: () => {
            this.notificationService.notifyUserAction('Car deleted successfully');

            const itemsOnCurrentPage = this.dataSource.data.length;
            if (itemsOnCurrentPage === 1 && this.currentPage > 1) {
              this.currentPage--;
            }

            this.loadCars();
          },
          error: (error) => {
            console.error('Error deleting car:', error);
            if (error.error && error.error.includes('association between entity types')) {
              this.notificationService.notifyUserAction(
                'Cannot delete this car because it is linked to an advertisement'
              );
            } else {
              this.notificationService.notifyUserAction('Error deleting car');
            }
          }
        });
      }
    });
  }

  getFuelTypeBadgeClass(fuelType: FuelType): string {
    switch (fuelType) {
      case FuelType.Electric:
        return 'fuel-type-electric';
      case FuelType.Hybrid:
        return 'fuel-type-hybrid';
      case FuelType.Petrol:
        return 'fuel-type-petrol';
      case FuelType.Diesel:
        return 'fuel-type-diesel';
      case FuelType.LPG:
        return 'fuel-type-lpg';
      default:
        return 'fuel-type-other';
    }
  }

  getEnumLabel(enumObj: any, value: number): string {
    return Object.entries(enumObj)
      .find(([key, val]) => val === value)?.[0] || '';
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCars(event);

    // Check if paginator is near bottom of viewport
    setTimeout(() => {
      if (this.paginatorElement) {
        const rect = this.paginatorElement.nativeElement.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          this.viewportScroller.scrollToPosition([
            0,
            window.pageYOffset + rect.bottom - window.innerHeight + 20
          ]);
        }
      }
    });
  }
}
