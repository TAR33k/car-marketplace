import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CarGetByIdResponse,
  CarGetByIdService
} from '../../../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';
import {CarUpdateOrInsertService} from '../../../../../endpoints/car-endpoints/car-update-or-insert-endpoint.service';


@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.css']
})
export class CarFormComponent implements OnInit {
  carId: number;
  car: CarGetByIdResponse = {
    id: 0,
    name: '',
    year: 2023,
    engineCapacity: 1.6,
    fuelType: '',
    transmission: '',
    doors: 4,
    fuelConsumption: 7.0,
    bodyID: 1,
    cityID: 1
  };

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private carGetByIdService: CarGetByIdService,
    private carUpdateService: CarUpdateOrInsertService
  ) {
    this.carId = 0;
  }

  ngOnInit(): void {
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Car Id', this.carId);

    if (this.carId && this.carId !== 0) {
      this.loadCarData();
    } else {
      this.car = {
        id: 0,
        name: '',
        year: 2023,
        engineCapacity: 1.6,
        fuelType: '',
        transmission: '',
        doors: 4,
        fuelConsumption: 7.0,
        bodyID: 1,
        cityID: 1
      };
    }
  }


  loadCarData(): void {
    this.carGetByIdService.handleAsync(this.carId).subscribe({
      next: (car) => this.car = car,
      error: (error) => console.error('Error loading car data', error)
    });
  }

  updateCar(): void {
    const updateRequest = {
      id: this.car.id,
      name: this.car.name,
      year: this.car.year,
      engineCapacity: this.car.engineCapacity,
      fuelType: this.car.fuelType,
      transmission: this.car.transmission,
      doors: this.car.doors,
      fuelConsumption: this.car.fuelConsumption,
      bodyID: this.car.bodyID,
      cityID: this.car.cityID
    };

    if (this.carId && this.carId !== 0) {
      this.carUpdateService.handleAsync(updateRequest).subscribe({
        next: () => this.router.navigate(['/admin/cars']),
        error: (error) => console.error('Error updating car', error)
      });
    } else {
      this.carUpdateService.handleAsync(updateRequest).subscribe({
        next: () => this.router.navigate(['/admin/cars']),
        error: (error) => console.error('Error adding new car', error)
      });
    }
  }
}
