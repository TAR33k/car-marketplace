import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementRefreshService {
  private refreshQuestionsSubject = new Subject<void>();
  private refreshAdvertisementsSubject = new Subject<void>();

  refreshQuestions$ = this.refreshQuestionsSubject.asObservable();
  refreshAdvertisements$ = this.refreshAdvertisementsSubject.asObservable();

  triggerQuestionsRefresh() {
    this.refreshQuestionsSubject.next();
  }

  refreshAdvertisements() {
    this.refreshAdvertisementsSubject.next();
  }
}
