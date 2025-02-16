import {
  SavedAdvertisementResponse,
  SavedAdvertisementService
} from '../../../endpoints/saved-advertisement-endpoints/saved-advertisement.service';
import {Component, OnInit} from '@angular/core';
import {NotificationService} from '../../../services/notification.service';

@Component({
  selector: 'app-saved-advertisements',
  templateUrl: './saved-advertisements.component.html',
  styleUrls: ['./saved-advertisements.component.scss']
})
export class SavedAdvertisementsComponent implements OnInit {
  savedAds: any[] = [];
  loading = false;

  constructor(
    private savedAdService: SavedAdvertisementService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadSavedAds();
  }

  loadSavedAds() {
    this.loading = true;
    this.savedAdService.getSavedAdvertisements().subscribe({
      next: (ads) => {
        this.savedAds = ads;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading saved ads:', error);
        this.notificationService.notifyUserAction('Error loading saved advertisements');
        this.loading = false;
      }
    });
  }

  removeFromSaved(ad: SavedAdvertisementResponse) {
    this.savedAdService.removeSavedAdvertisement(ad.advertisementID).subscribe({
      next: () => {
        this.savedAds = this.savedAds.filter(savedAd => savedAd.id !== ad.id);
        this.notificationService.notifyUserAction('Advertisement removed from saved');
      },
      error: (error) => {
        if (error.status === 404) {
          // If the saved ad is not found, remove it from the local list anyway
          this.savedAds = this.savedAds.filter(savedAd => savedAd.id !== ad.id);
          this.notificationService.notifyUserAction('Advertisement removed from saved');
        } else {
          console.error('Error removing saved ad:', error);
          this.notificationService.notifyUserAction('Error removing advertisement from saved');
        }
      }
    });
  }
}
