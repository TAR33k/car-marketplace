import { Component, Input, OnInit } from '@angular/core';
import { ProfileGetStatisticsEndpointService, ProfileGetStatisticsResponse } from '../../../endpoints/profile-endpoints/profile-get-statistics-endpoint.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-profile-statistics',
  templateUrl: './profile-statistics.component.html',
  styleUrls: ['./profile-statistics.component.scss']
})
export class ProfileStatisticsComponent implements OnInit {
  @Input() userId!: number;

  statistics: ProfileGetStatisticsResponse = {
    totalAdvertisements: 0,
    activeAdvertisements: 0,
    totalViews: 0,
    totalSold: 0,
    topPerformingAds: []
  };

  loading = false;

  constructor(
    private statisticsEndpoint: ProfileGetStatisticsEndpointService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics() {
    this.loading = true;
    this.statisticsEndpoint.handleAsync(this.userId).subscribe({
      next: (response) => {
        this.statistics = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.notificationService.notifyUserAction('Error loading profile statistics');
        this.loading = false;
      }
    });
  }
}
