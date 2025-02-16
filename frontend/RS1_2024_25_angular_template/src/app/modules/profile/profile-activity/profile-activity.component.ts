import { Component, Input, OnInit } from '@angular/core';
import { ProfileGetActivityEndpointService, ProfileGetActivityResponse } from '../../../endpoints/profile-endpoints/profile-get-activity-endpoint.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-profile-activity',
  templateUrl: './profile-activity.component.html',
  styleUrls: ['./profile-activity.component.scss']
})
export class ProfileActivityComponent implements OnInit {
  @Input() userId!: number;
  activities: ProfileGetActivityResponse[] = [];
  loading = false;

  constructor(
    private activityEndpoint: ProfileGetActivityEndpointService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadActivity();
  }

  private loadActivity() {
    this.loading = true;
    this.activityEndpoint.handleAsync(this.userId).subscribe({
      next: (response) => {
        this.activities = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.notificationService.notifyUserAction('Error loading profile activity');
        this.loading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'advertisement_created': return 'add_circle';
      case 'advertisement_updated': return 'edit';
      case 'advertisement_sold': return 'sell';
      case 'message_received': return 'message';
      case 'question_received': return 'help';
      case 'advertisement_saved': return 'bookmark';
      default: return 'history';
    }
  }
}
