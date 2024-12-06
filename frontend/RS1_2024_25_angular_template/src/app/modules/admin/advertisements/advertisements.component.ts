import {Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import {merge, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, finalize, takeUntil, tap} from 'rxjs/operators';
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
import {MatSort, Sort} from '@angular/material/sort';

@Component({
  selector: 'app-advertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.scss']
})
export class AdvertisementsComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly displayedColumns: string[] = ['title', 'price', 'condition', 'status', 'car', 'user', 'viewCount', 'actions'];
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
  @ViewChild(MatSort) sort!: MatSort;

  sortActive = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private advertisementGetService: AdvertisementGetAllEndpointService,
    private advertisementDeleteService: AdvertisementDeleteEndpointService,
    private statusTypeService: StatusTypeGetAllEndpointService,
    private advertisementUpdateStatusService: AdvertisementUpdateStatusEndpointService,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.filterForm = this.initializeFilterForm();
  }

  ngOnInit(): void {
    // First load status types
    this.loadStatusTypes().pipe(
      takeUntil(this.destroy$),
      tap(() => {
        // After status types are loaded, setup filter and fetch data
        this.setupFilterSubscription();
        this.fetchAdvertisements();
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    // Initialize dataSource sort
    this.dataSource.sort = this.sort;

    // Merge sort and page events
    merge(
      this.sort.sortChange,
      this.paginator.page,
      this.filterForm.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
    )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.fetchAdvertisements();
      });

    // Initial load
    this.fetchAdvertisements();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStatusTypes(): Observable<StatusTypeGetAllResponse[]> {
    return this.statusTypeService.handleAsync()
      .pipe(
        tap((statuses) => {
          console.log('Loaded Status Types:', statuses);
          this.statusOptions = statuses;
        })
      );
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

  fetchAdvertisements(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    const filters: AdvertGetAllRequest = {
      pageNumber: this.paginator ? this.paginator.pageIndex + 1 : 1,
      pageSize: this.paginator ? this.paginator.pageSize : this.pageSize,
      searchTerm: this.filterForm.get('searchTerm')?.value,
      minPrice: this.filterForm.get('minPrice')?.value,
      maxPrice: this.filterForm.get('maxPrice')?.value,
      statusId: this.filterForm.get('status')?.value,
      condition: this.filterForm.get('condition')?.value,
      dateFrom: this.filterForm.get('dateFrom')?.value,
      dateTo: this.filterForm.get('dateTo')?.value,
      sortBy: this.sort?.active,
      sortDirection: this.sort?.direction || 'asc'
    };

    // Clean up undefined values
    Object.keys(filters).forEach(key => {
      const value = filters[key as keyof typeof filters];
      if (value === undefined || value === null || value === '') {
        delete filters[key as keyof typeof filters];
      }
    });

    this.advertisementGetService.handleAsync(filters)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.dataItems.map(item => ({
            ...item,
            statusId: item.statusID,
            status: this.statusOptions.find(s => s.id === item.statusID)?.name || ''
          }));
          this.totalItems = response.totalCount;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
        },
        error: (error) => {
          console.error('Error fetching advertisements:', error);
          this.snackBar.open('Error fetching advertisements', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.dataSource.data = [];
          this.totalItems = 0;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
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

    const oldStatusId = updatingAd.statusID;
    const oldStatus = updatingAd.status;

    updatingAd.isStatusUpdating = true;
    updatingAd.statusID = newStatusId;
    updatingAd.status = this.statusOptions.find(s => s.id === newStatusId)?.name || '';
    this.dataSource._updateChangeSubscription();

    this.advertisementUpdateStatusService.handleAsync({ advertisementId, newStatusId })
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
            panelClass: ['success-snackbar']
          });
        },
        error: () => {
          updatingAd.statusID = oldStatusId;
          updatingAd.status = oldStatus;
          this.dataSource._updateChangeSubscription();

          this.snackBar.open('Failed to update status', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  async deleteAdvertisement(id: number): Promise<void> {
    try {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Delete Advertisement',
          message: 'Are you sure you want to delete this advertisement?',
          confirmText: 'Delete',
          cancelText: 'Cancel'
        }
      });

      const result = await dialogRef.afterClosed().toPromise();

      if (result) {
        await this.advertisementDeleteService.handleAsync(id).toPromise();

        // Remove the deleted item from the data source
        const index = this.dataSource.data.findIndex(ad => ad.id === id);
        if (index > -1) {
          const updatedData = [...this.dataSource.data];
          updatedData.splice(index, 1);
          this.dataSource.data = updatedData;
        }

        // Update the total count
        this.totalItems--;

        // If we deleted the last item on the current page, go to the previous page
        if (this.dataSource.data.length === 0 && this.paginator.pageIndex > 0) {
          this.paginator.pageIndex--;
          await this.fetchAdvertisements();
        }

        // Show success message
        this.snackBar.open('Advertisement deleted successfully', 'Close', {
          duration: 3000
        });
      }
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        this.snackBar.open('Error deleting advertisement', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
    }
  }

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getConditionLabel(condition: VehicleCondition): string {
    return VehicleCondition[condition];
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'active': 'check_circle',
      'pending': 'pending',
      'sold': 'shopping_cart',
      'expired': 'schedule',
      'rejected': 'cancel'
    };

    return iconMap[status.toLowerCase()] || 'help_outline';
  }
}
