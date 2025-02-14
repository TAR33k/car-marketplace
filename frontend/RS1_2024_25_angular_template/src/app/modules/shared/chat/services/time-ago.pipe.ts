import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  pure: false
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | undefined): string {
    if (!value) {
      return 'Never';
    }

    const seconds = Math.floor((new Date().getTime() - value.getTime()) / 1000);

    if (seconds < 30) {
      return 'Just now';
    }

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    let counter;
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      counter = Math.floor(seconds / secondsInUnit);
      if (counter > 0) {
        if (counter === 1) {
          return `${counter} ${unit} ago`;
        } else {
          return `${counter} ${unit}s ago`;
        }
      }
    }

    return 'Just now';
  }
}
