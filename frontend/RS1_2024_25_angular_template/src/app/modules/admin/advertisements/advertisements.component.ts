import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, takeUntil} from 'rxjs/operators';
import { VehicleCondition } from '../../../services/car-services/car-enums';
import {
  AdvertGetAllRequest,
  AdvertGetAllResponse,
  AdvertisementGetAllEndpointService,
  PagedAdvertResponse
} from '../../../endpoints/advertisement-endpoints/advertisement-get-all-endpoint.service';
import {
  StatusTypeGetAllEndpointService,
  StatusTypeGetAllResponse
} from '../../../endpoints/status-type-endpoints/status-type-get-all-endpoint.service';
import {
  AdvertisementDeleteEndpointService
} from '../../../endpoints/advertisement-endpoints/advertisement-delete-endpoint.service';
import {
  AdvertisementUpdateStatusEndpointService,
  AdvertStatusUpdateRequest
} from '../../../endpoints/advertisement-endpoints/advertisement-update-status-endpoint.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-advertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.scss']
})
export class AdvertisementsComponent implements OnInit, OnDestroy {
  readonly displayedColumns: string[] = ['title', 'price', 'condition', 'status', 'car', 'user', 'views', 'actions'];
  readonly VehicleCondition = VehicleCondition; // Make enum available in template

  dataSource = new MatTableDataSource<AdvertGetAllResponse>();
  filterForm: FormGroup;
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  statusOptions: StatusTypeGetAllResponse[] = [];
  conditionOptions = Object.entries(VehicleCondition)
    .filter(([key]) => !isNaN(Number(key))) // Filter out reverse mappings
    .map(([key, value]) => ({
      value: Number(key),
      label: value as string
    }));

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  constructor(
    private advertisementGetService: AdvertisementGetAllEndpointService,
    private advertisementDeleteService: AdvertisementDeleteEndpointService,
    private statusTypeService: StatusTypeGetAllEndpointService,
    private advertisementUpdateStatusService: AdvertisementUpdateStatusEndpointService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.filterForm = this.initializeFilterForm();
  }

  ngOnInit(): void {
    this.loadStatusTypes();
    this.setupFilterSubscription();
    this.fetchAdvertisements();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatusTypes(): void {
    this.statusTypeService.handleAsync()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statuses) => {
          this.statusOptions = statuses;
          // After loading statuses, fetch advertisements
          this.fetchAdvertisements();
        },
        error: (error) => {
          console.error('Error loading status types:', error);
          this.snackBar.open('Error loading status types', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private initializeFilterForm(): FormGroup {
    return this.fb.group({
      searchTerm: [''],
      minPrice: [null],
      maxPrice: [null],
      status: [null],
      condition: [null],
      dateFrom: [null],
      dateTo: [null]
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(() => {
        if (this.paginator) {
          this.paginator.firstPage();
        }
        this.currentPage = 1;
        this.fetchAdvertisements();
      });
  }

  fetchAdvertisements(event?: PageEvent): void {
    this.isLoading = true;
    const filters: AdvertGetAllRequest = {
      pageNumber: event?.pageIndex !== undefined ? event.pageIndex + 1 : this.currentPage,
      pageSize: event?.pageSize || this.pageSize,
      searchTerm: this.filterForm.get('searchTerm')?.value,
      minPrice: this.filterForm.get('minPrice')?.value,
      maxPrice: this.filterForm.get('maxPrice')?.value,
      statusId: this.filterForm.get('status')?.value,
      condition: this.filterForm.get('condition')?.value,
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value
    };

    // Remove null/undefined/empty string values
    Object.keys(filters).forEach(key => {
      const typedKey = key as keyof AdvertGetAllRequest;
      const value = filters[typedKey];
      if (value === undefined || value === null || value === '') {
        delete filters[typedKey];
      }
    });

    this.advertisementGetService.handleAsync(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PagedAdvertResponse) => {
          this.dataSource.data = response.dataItems.map(item => ({
            ...item,
            statusId: item.statusId,
            status: this.statusOptions.find(s => s.id === item.statusId)?.name || ''
          }));
          this.totalItems = response.totalCount;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;

          if (this.paginator) {
            this.paginator.length = this.totalItems;
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
          }
        },
        error: (err) => console.error('Error fetching advertisements:', err),
        complete: () => this.isLoading = false
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.fetchAdvertisements();
  }

  editAdvertisement(id: number): void {
    this.router.navigate(['/admin/advertisements/edit', id]);
  }

  updateAdvertisementStatus(advertisementId: number, newStatusId: number): void {
    if (!newStatusId) return;

    const updatingAd = this.dataSource.data.find(ad => ad.id === advertisementId);
    if (!updatingAd) return;

    const oldStatusId = updatingAd.statusId;
    const oldStatus = updatingAd.status;

    // Optimistically update the UI
    updatingAd.isStatusUpdating = true;
    updatingAd.statusId = newStatusId;
    updatingAd.status = this.statusOptions.find(s => s.id === newStatusId)?.name || '';
    this.dataSource._updateChangeSubscription();

    const request: AdvertStatusUpdateRequest = {
      advertisementId,
      newStatusId
    };

    this.advertisementUpdateStatusService.handleAsync(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          updatingAd.isStatusUpdating = false;
          this.dataSource._updateChangeSubscription();
        })
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Status updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Error updating status:', error);

          // Revert changes on error
          updatingAd.statusId = oldStatusId;
          updatingAd.status = oldStatus;
          this.dataSource._updateChangeSubscription();

          this.snackBar.open('Failed to update status', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'bottom',
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  deleteAdvertisement(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Advertisement',
        message: 'Are you sure you want to delete this advertisement?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.isLoading = true;
          this.advertisementDeleteService.handleAsync(id).subscribe({
            next: () => {
              this.fetchAdvertisements();
            },
            error: (err) => {
              console.error('Error deleting advertisement:', err);
              this.isLoading = false;
            }
          });
        }
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchAdvertisements(event);
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getConditionLabel(condition: VehicleCondition): string {
    return VehicleCondition[condition];
  }
}
