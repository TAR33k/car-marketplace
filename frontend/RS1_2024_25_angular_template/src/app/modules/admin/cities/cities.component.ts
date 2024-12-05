import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CityGetAll1EndpointService, CityGetAll1Response } from '../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import { CityDeleteEndpointService } from '../../../endpoints/city-endpoints/city-delete-endpoint.service';
import { CountryGetAllEndpointService, CountryGetAllResponse } from '../../../endpoints/country-endpoints/country-get-all-endpoint.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})
export class CitiesComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'countryName', 'actions'];
  dataSource = new MatTableDataSource<CityGetAll1Response>();
  countries: CountryGetAllResponse[] = [];
  selectedCountry: string = '';
  searchText: string = '';
  isFiltered: boolean = false;
  private searchSubject = new Subject<string>();

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private cityGetService: CityGetAll1EndpointService,
    private cityDeleteService: CityDeleteEndpointService,
    private countryGetAllService: CountryGetAllEndpointService,
    private router: Router,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.dataSource.filterPredicate = this.createFilter();

    // Set up real-time search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchValue => {
      this.searchText = searchValue;
      this.updateFilter();
    });
  }

  ngOnInit(): void {
    this.fetchCities();
    this.fetchCountries();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  fetchCities(): void {
    this.cityGetService.handleAsync().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (err) => {
        console.error('Error fetching cities:', err);
        this.notificationService.notifyUserAction('Error fetching cities');
      }
    });
  }

  fetchCountries(): void {
    this.countryGetAllService.handleAsync().subscribe({
      next: (data) => {
        this.countries = data;
      },
      error: (err) => {
        console.error('Error fetching countries:', err);
        this.notificationService.notifyUserAction('Error fetching countries');
      }
    });
  }

  createFilter(): (data: CityGetAll1Response, filter: string) => boolean {
    return (data: CityGetAll1Response, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);

      const searchFilter = !searchTerms.searchText ||
        data.name.toLowerCase().includes(searchTerms.searchText.toLowerCase()) ||
        data.countryName.toLowerCase().includes(searchTerms.searchText.toLowerCase());

      const countryFilter = !searchTerms.countryId ||
        data.countryName.toLowerCase() === searchTerms.countryId.toLowerCase();

      return searchFilter && countryFilter;
    };
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  applyCountryFilter(): void {
    this.updateFilter();
  }

  updateFilter(): void {
    const filterValue = JSON.stringify({
      searchText: this.searchText,
      countryId: this.selectedCountry
    });

    this.dataSource.filter = filterValue;
    this.isFiltered = !!(this.searchText || this.selectedCountry);
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCountry = '';
    this.updateFilter();

    // Clear the search input field
    const searchInput = document.querySelector('input[matInput]') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
  }

  editCity(id: number): void {
    this.router.navigate(['/admin/cities/edit', id]);
  }

  deleteCity(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this city?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cityDeleteService.handleAsync(id).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(city => city.id !== id);
            this.notificationService.notifyUserAction('City deleted successfully');
          },
          error: (err) => {
            console.error('Error deleting city:', err);
            this.notificationService.notifyUserAction('Error deleting city');
          }
        });
      }
    });
  }
}
