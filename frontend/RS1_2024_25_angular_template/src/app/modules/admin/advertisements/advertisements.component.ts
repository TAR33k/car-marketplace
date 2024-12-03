import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  AdvertisementGetAllEndpointService,
  AdvertGetAllResponse,
  AdvertGetAllRequest, PagedAdvertResponse
} from '../../../endpoints/advertisement-endpoints/advertisement-get-all-endpoint.service';
import { AdvertisementDeleteEndpointService } from '../../../endpoints/advertisement-endpoints/advertisement-delete-endpoint.service';

@Component({
  selector: 'app-advertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.css']
})
export class AdvertisementsComponent {
  advertisements: AdvertGetAllResponse[] = [];
  request: AdvertGetAllRequest = {
    pageNumber: 1,
    pageSize: 10
  };
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(
    private advertisementGetService: AdvertisementGetAllEndpointService,
    private advertisementDeleteService: AdvertisementDeleteEndpointService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAdvertisements();
  }

  fetchAdvertisements(): void {
    // Create a clean request object
    const cleanRequest = {
      pageNumber: this.request.pageNumber,
      pageSize: this.request.pageSize
    } as AdvertGetAllRequest;

    // Only add properties that have values
    if (this.request.searchTerm) {
      cleanRequest.searchTerm = this.request.searchTerm;
    }
    if (typeof this.request.condition === 'number') {
      cleanRequest.condition = this.request.condition;
    }
    if (typeof this.request.minPrice === 'number') {
      cleanRequest.minPrice = this.request.minPrice;
    }
    if (typeof this.request.maxPrice === 'number') {
      cleanRequest.maxPrice = this.request.maxPrice;
    }
    if (typeof this.request.statusId === 'number') {
      cleanRequest.statusId = this.request.statusId;
    }

    this.advertisementGetService.handleAsync(cleanRequest).subscribe({
      next: (response: PagedAdvertResponse) => {
        this.advertisements = response.dataItems;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
      },
      error: (err) => console.error('Error fetching advertisements:', err)
    });
  }

  onSearch(searchTerm: string): void {
    if (searchTerm.trim()) {
      this.request = {
        ...this.request,
        searchTerm: searchTerm.trim()
      };
    } else {
      delete (this.request as any).searchTerm;
    }
    this.request.pageNumber = 1;
    this.fetchAdvertisements();
  }

  onFilterChange(filters: Partial<AdvertGetAllRequest>): void {
    // Create a new request with only defined values
    const newRequest = {
      ...this.request,
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      ),
      pageNumber: 1 // Reset to first page when filters change
    };

    this.request = newRequest;
    this.fetchAdvertisements();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.request.pageNumber = page;
      this.fetchAdvertisements();
    }
  }

  onPageSizeChange(newSize: number): void {
    if (newSize > 0) {
      this.request.pageSize = newSize;
      this.request.pageNumber = 1;
      this.fetchAdvertisements();
    }
  }

  editAdvertisement(id: number): void {
    this.router.navigate(['/admin/advertisements/edit', id]);
  }

  deleteAdvertisement(id: number): void {
    if (confirm('Are you sure you want to delete this advertisement?')) {
      this.advertisementDeleteService.handleAsync(id).subscribe({
        next: () => {
          console.log(`Advertisement with ID ${id} deleted successfully`);
          this.advertisements = this.advertisements.filter(ad => ad.id !== id);
        },
        error: (err) => console.error('Error deleting advertisement:', err)
      });
    }
  }
}
