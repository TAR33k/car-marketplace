import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CityUpdateOrInsertEndpointService } from '../../../../endpoints/city-endpoints/city-update-or-insert-endpoint.service';
import { CityGetByIdEndpointService, CityGetByIdResponse } from '../../../../endpoints/city-endpoints/city-get-by-id-endpoint.service';
import { CountryGetAllEndpointService, CountryGetAllResponse } from '../../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-cities-edit',
  templateUrl: './cities-edit.component.html',
  styleUrls: ['./cities-edit.component.scss']
})
export class CitiesEditComponent implements OnInit {
  @ViewChild('cityForm') cityForm!: NgForm;

  cityId: number;
  city: CityGetByIdResponse = {
    id: 0,
    name: '',
    countryId: 0
  };
  countries: CountryGetAllResponse[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cityGetByIdService: CityGetByIdEndpointService,
    private cityUpdateService: CityUpdateOrInsertEndpointService,
    private countryGetAllService: CountryGetAllEndpointService,
    private notificationService: NotificationService
  ) {
    this.cityId = 0;
  }

  ngOnInit(): void {
    this.cityId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.cityId) {
      this.loadCityData();
    }
    this.loadCountries();
  }

  loadCityData(): void {
    this.cityGetByIdService.handleAsync(this.cityId).subscribe({
      next: (city) => this.city = city,
      error: (error) => {
        console.error('Error loading city data', error);
        this.notificationService.notifyUserAction('Error loading city data');
      }
    });
  }

  loadCountries(): void {
    this.countryGetAllService.handleAsync().subscribe({
      next: (countries) => this.countries = countries,
      error: (error) => {
        console.error('Error loading countries', error);
        this.notificationService.notifyUserAction('Error loading countries');
      }
    });
  }

  updateCity(): void {
    if (this.cityForm.invalid) {
      this.markFormGroupTouched(this.cityForm);
      return;
    }

    this.cityUpdateService.handleAsync({
      countryId: this.city.countryId,
      name: this.city.name,
      id: this.cityId
    }).subscribe({
      next: () => {
        this.notificationService.notifyUserAction('City updated successfully');
        this.router.navigate(['/admin/cities']);
      },
      error: (error) => {
        console.error('Error updating city', error);
        this.notificationService.notifyUserAction('Error updating city');
      }
    });
  }

  private markFormGroupTouched(form: NgForm): void {
    Object.values(form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
