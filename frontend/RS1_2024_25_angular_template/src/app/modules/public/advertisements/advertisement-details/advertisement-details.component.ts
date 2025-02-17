import {Component, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdvertisementGetByIdEndpointService } from '../../../../endpoints/advertisement-endpoints/advertisement-get-by-id-endpoint.service';
import { CarGetByIdEndpointService } from '../../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';
import { UserGetByIdEndpointService } from '../../../../endpoints/user-endpoints/user-get-by-id-endpoint.service';
import { AdvertisementImagesGetByIdEndpointService } from '../../../../endpoints/car-image-endpoints/car-image-get-by-advert-endpoint.service';
import { MyAuthService } from '../../../../services/auth-services/my-auth.service';
import {Subject, takeUntil} from 'rxjs';
import {AdvertisementRefreshService} from '../../../../services/advertisement-refresh.service';
import {FuelType, TransmissionType, VehicleCondition} from '../../../../services/car-services/car-enums';
import {ImageGalleryDialogComponent} from './image-gallery-dialog.component';
import {
  SavedAdvertisementService
} from '../../../../endpoints/saved-advertisement-endpoints/saved-advertisement.service';
import {ConfirmDialogComponent} from '../../../shared/confirm-dialog/confirm-dialog.component';
import {
  AdvertisementUpdateStatusEndpointService
} from '../../../../endpoints/advertisement-endpoints/advertisement-update-status-endpoint.service';
import {AdvertisementCacheService} from '../../../../services/advertisement-cache.service';

@Component({
  selector: 'app-advertisement-details',
  templateUrl: './advertisement-details.component.html',
  styleUrls: ['./advertisement-details.component.scss']
})
export class AdvertisementDetailsComponent implements OnInit, OnDestroy {
  adId: number;
  advertisement: any;
  car: any;
  seller: any;
  images: any[] = [];
  selectedImageIndex = 0;
  isLoading = true;
  currentUserId: number | null;
  private destroy$ = new Subject<void>();
  isSaved: boolean = false;

  readonly STATUS = {
    ACTIVE: 'Active',
    SOLD: 'Sold',
    EXPIRED: 'Expired',
    PENDING: 'Pending',
    REJECTED: 'Rejected'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adService: AdvertisementGetByIdEndpointService,
    private carService: CarGetByIdEndpointService,
    private userService: UserGetByIdEndpointService,
    private imageService: AdvertisementImagesGetByIdEndpointService,
    private authService: MyAuthService,
    private refreshService: AdvertisementRefreshService,
    private savedAdvertService: SavedAdvertisementService,
    private adUpdateService: AdvertisementUpdateStatusEndpointService,
    private cacheService: AdvertisementCacheService
  ) {
    this.adId = 0;
    this.currentUserId = this.authService.getMyAuthInfo()?.userId ?? null;
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.adId = +params['id'];
      this.loadAdvertisement();
    });

    this.refreshService.refreshQuestions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAdvertisement();
      });

    if (this.currentUserId) {
      this.checkIfSaved();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadAdvertisement() {
    try {
      this.isLoading = true;

      // Load advertisement details
      this.advertisement = await this.adService.handleAsync(this.adId).toPromise();

      // Load car details
      this.car = await this.carService.handleAsync(this.advertisement.carID).toPromise();

      // Load seller details
      this.seller = await this.userService.handleAsync(this.advertisement.userID).toPromise();

      // Load images
      const images = await this.imageService.handleAsync(this.adId).toPromise();
      this.images = images!.sort((a, b) => (a.isPrimary ? -1 : 1));
    } catch (error) {
      this.snackBar.open('Error loading advertisement details', 'Close', {
        duration: 3000
      });
      this.router.navigate(['/advertisements']);
    } finally {
      this.isLoading = false;
    }
  }

  openChat() {
    if (!this.currentUserId) {
      this.snackBar.open('Please login to chat with the seller', 'Close', {
        duration: 3000
      });
      return;
    }

    // Navigate to chat and store seller info in session storage
    const chatUser = {
      id: this.seller.id,
      username: `${this.seller.firstName} ${this.seller.lastName}`,
      email: this.seller.email,
      firstName: this.seller.firstName,
      lastName: this.seller.lastName
    };

    sessionStorage.setItem('selectedChatUser', JSON.stringify(chatUser));
    this.router.navigate(['/chat']);
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  shareOnFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  }

  shareOnTwitter() {
    const url = window.location.href;
    const text = `Check out this ${this.car.year} ${this.car.model.manufacturer.name} ${this.car.model.name}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  }

  get isAdvertisementOwner(): boolean {
    const authInfo = this.authService.getMyAuthInfo();
    if (!authInfo) {
      return false;
    }
    return authInfo?.isLoggedIn && authInfo.userId === this.advertisement?.userID;
  }

  getConditionString(condition: number): string {
    if (condition === undefined) return '';
    return VehicleCondition[condition] || 'Unknown';
  }

  getFuelTypeName(fuelType: FuelType | undefined): string {
    if (fuelType === undefined) return '';
    return FuelType[fuelType] || 'Unknown';
  }

  getTransmissionTypeName(transmissionType: TransmissionType | undefined): string {
    if (transmissionType === undefined) return '';
    return TransmissionType[transmissionType] || 'Unknown';
  }

  getCountryFlag(countryName: string): string {
    const countryCodeMap: { [key: string]: string } = {
      'USA': 'us',
      'United Kingdom': 'gb',
      'Germany': 'de',
      'France': 'fr',
      'Italy': 'it',
      'Spain': 'es',
      'Portugal': 'pt',
      'Netherlands': 'nl',
      'Belgium': 'be',
      'Switzerland': 'ch',
      'Austria': 'at',
      'Sweden': 'se',
      'Norway': 'no',
      'Denmark': 'dk',
      'Finland': 'fi',
      'Poland': 'pl',
      'Czech Republic': 'cz',
      'Hungary': 'hu',
      'Croatia': 'hr',
      'Serbia': 'rs',
      'Romania': 'ro',
      'Bulgaria': 'bg',
      'Greece': 'gr',
      'Turkey': 'tr',
      'Bosnia and Herzegovina': 'ba'
    };

    const code = countryCodeMap[countryName]?.toLowerCase();
    if (!code) return '';

    return `https://flagcdn.com/24x18/${code}.png`;
  }

  editAdvertisement() {
    this.router.navigate(['/public/advertisements/edit', this.adId]);
  }

  openGallery() {
    if (!this.images || this.images.length === 0) {
      this.snackBar.open('No images available for this advertisement', 'Close', {
        duration: 3000
      });
      return;
    }

    const dialogRef = this.dialog.open(ImageGalleryDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: 'fullscreen-dialog',
      data: {
        images: this.images,
        title: this.advertisement.title,
        startIndex: this.selectedImageIndex
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'number') {
        this.selectedImageIndex = result;
      }
    });
  }

  private async checkIfSaved() {
    if (!this.currentUserId) return;

    try {
      this.isSaved = await this.savedAdvertService.isSaved(this.adId).toPromise() || false;
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }

  async toggleSave() {
    if (!this.currentUserId) {
      this.snackBar.open('Please login to save advertisements', 'Close', {
        duration: 3000
      });
      return;
    }

    try {
      if (this.isSaved) {
        await this.savedAdvertService.removeSavedAdvertisement(this.adId).toPromise();
        this.snackBar.open('Advertisement removed from saved', 'Close', {duration: 3000});
      } else {
        await this.savedAdvertService.addSavedAdvertisement(this.adId).toPromise();
        this.snackBar.open('Advertisement saved', 'Close', {duration: 3000});
      }
      this.isSaved = !this.isSaved;
    } catch (error: any) {
      const message = error.status === 400
        ? 'Advertisement already saved'
        : 'Error updating saved status';
      this.snackBar.open(message, 'Close', {duration: 3000});
    }
  }

  navigateToUserProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  updateStatus(newStatus: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Update Status',
        message: `Are you sure you want to mark this advertisement as ${newStatus.toLowerCase()}?`,
        confirmText: 'Yes',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const statusMap: { [key: string]: number } = {
          'Active': 1,
          'Sold': 2,
          'Expired': 3,
          'Pending': 4,
          'Rejected': 5
        };

        this.adUpdateService.handleAsync({
          advertisementId: this.adId,
          newStatusId: statusMap[newStatus]
        }).subscribe({
          next: () => {
            // Invalidate cache for the user
            this.cacheService.invalidateUserCache(this.advertisement.userID);

            this.snackBar.open(
              `Advertisement marked as ${newStatus.toLowerCase()}`,
              'Close',
              {duration: 3000}
            );

            // Reload advertisement details
            this.loadAdvertisement();

            // Notify the refresh service to update other components
            this.refreshService.refreshAdvertisements();
          },
          error: (error) => {
            this.snackBar.open(
              'Error updating advertisement status',
              'Close',
              {duration: 3000}
            );
            console.error('Error updating status:', error);
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }
}
