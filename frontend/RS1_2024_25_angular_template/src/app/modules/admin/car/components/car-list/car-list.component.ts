import { Component, OnInit } from '@angular/core';
import {CarDeleteEndpointService} from '../../../../../endpoints/car-endpoints/car-delete-endpoint.service';
import {CarGetAllResponse, CarGetAllService} from '../../../../../endpoints/car-endpoints/car-get-all-endpoint.service';


@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.css']
})
export class CarListComponent implements OnInit {
  cars: CarGetAllResponse[] = [];

  constructor(
    private carService: CarGetAllService,
    private carDeleteService: CarDeleteEndpointService
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.carService.handleAsync().subscribe(
      (data: any) => {
        if (Array.isArray(data)) {
          this.cars = data;
        } else {
          console.error('Expected an array but received:', data);
          alert('Unexpected response from the server');
        }
      },
      (error) => {
        console.error('Error loading cars:', error);
      }
    );
  }


  deleteCar(id: number): void {
    if (confirm('Are you sure you want to delete this car?')) {
      this.carDeleteService.handleAsync(id).subscribe(() => {
        alert('Car deleted successfully');
        this.loadCars();
      });
    }
  }
}
