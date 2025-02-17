import {Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy} from '@angular/core';
import { AdvertisementGetByUserEndpointService, AdvertGetByUserResponse } from '../../../endpoints/advertisement-endpoints/advertisement-get-by-user-endpoint.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { NotificationService } from '../../../services/notification.service';
import {
  AdvertisementDeleteEndpointService
} from '../../../endpoints/advertisement-endpoints/advertisement-delete-endpoint.service';
import {ConfirmDialogComponent} from '../../shared/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Subject, takeUntil} from 'rxjs';
import {AdvertisementCacheService} from '../../../services/advertisement-cache.service';
import {AdvertisementRefreshService} from '../../../services/advertisement-refresh.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-user-advertisements',
  templateUrl: './user-advertisements.component.html',
  styleUrls: ['./user-advertisements.component.scss']
})
export class UserAdvertisementsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() userId!: number;
  @Input() showExpired = false;

  advertisements: AdvertGetByUserResponse[] = [];
  loading = false;
  activeTab = 0;

  readonly STATUS = {
    ACTIVE: 1,
    SOLD: 2,
    EXPIRED: 3
  };
  private destroy$ = new Subject<void>();

  constructor(
    private advertService: AdvertisementGetByUserEndpointService,
    private notificationService: NotificationService,
    private deleteService: AdvertisementDeleteEndpointService,
    private cacheService: AdvertisementCacheService,
    private dialog: MatDialog,
    private refreshService: AdvertisementRefreshService,
    private router: Router,
  ) {
    this.cacheService.getCacheInvalidations()
      .pipe(takeUntil(this.destroy$))
      .subscribe(key => {
        if (key?.startsWith(`user_${this.userId}`)) {
          this.loadAdvertisements(true);
        }
      });
  }

  ngOnInit() {
    if (this.userId) {
      this.loadAdvertisements();
    }

    this.refreshService.refreshAdvertisements$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAdvertisements(true);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.activeTab = 0; // Reset to first tab
      this.loadAdvertisements();
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    this.activeTab = event.index;
    this.loadAdvertisements();
  }

  private loadAdvertisements(forceRefresh: boolean = false) {
    if (!this.userId) return;

    this.loading = true;
    let statusID: number | undefined;

    switch (this.activeTab) {
      case 0: statusID = this.STATUS.ACTIVE; break;
      case 1: statusID = this.STATUS.SOLD; break;
      case 2: statusID = this.STATUS.EXPIRED; break;
    }

    const cacheKey = this.cacheService.getCacheKey(this.userId, statusID);

    if (!forceRefresh) {
      const cachedData = this.cacheService.get(cacheKey);
      if (cachedData) {
        this.advertisements = cachedData.dataItems;
        this.loading = false;
        return;
      }
    }

    this.advertService.handleAsync({
      userID: this.userId,
      statusID: statusID,
      pageNumber: 1,
      pageSize: 10
    }).subscribe({
      next: (response) => {
        if (response && response.dataItems) {
          this.advertisements = response.dataItems;
          this.cacheService.set(cacheKey, response, false);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading advertisements:', error);
        this.notificationService.notifyUserAction('Error loading advertisements');
        this.loading = false;
      }
    });
  }

  onActionTriggered(event: { action: string, adId: number }) {
    if (event.action === 'delete') {
      this.openDeleteConfirmDialog(event.adId);
    } else if (event.action === 'edit') {
        this.router.navigate(['/public/advertisements/edit', event.adId]);
    }
  }

  private openDeleteConfirmDialog(adId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: 'Are you sure you want to delete this advertisement? This action cannot be undone.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteAdvertisement(adId);
      }
    });
  }

  private deleteAdvertisement(adId: number): void {
    this.loading = true;
    this.deleteService.handleAsync(adId).subscribe({
      next: () => {
        this.notificationService.notifyUserAction('Advertisement deleted successfully');
        this.cacheService.invalidateUserCache(this.userId);
        this.loadAdvertisements(true);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting advertisement:', error);
        this.notificationService.notifyUserAction(
          error.status === 404
            ? 'Advertisement not found'
            : 'Error deleting advertisement'
        );
        this.loading = false;
      }
    });
  }
}
