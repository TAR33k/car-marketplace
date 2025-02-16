import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleCondition } from '../../../services/car-services/car-enums';

@Component({
  selector: 'app-advertisement-grid',
  templateUrl: './advertisement-grid.component.html',
  styleUrls: ['./advertisement-grid.component.scss']
})
export class AdvertisementGridComponent {
  @Input() advertisements: any[] = [];
  @Input() loading = false;
  @Input() showActions = false;
  @Output() actionTriggered = new EventEmitter<{action: string, adId: number}>();

  constructor(private router: Router) {}

  onCardClick(adId: number, event: Event) {
    if (!(event.target as HTMLElement).closest('.action-buttons')) {
      this.router.navigate(['/public/advertisements', adId]);
    }
  }

  onAction(event: Event, action: string, adId: number) {
    event.stopPropagation();
    this.actionTriggered.emit({ action, adId });
  }

  getConditionLabel(condition: VehicleCondition): string {
    return VehicleCondition[condition];
  }
}
