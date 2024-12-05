import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';
import {
  CarGetByIdEndpointService,
  CarGetByIdResponse
} from '../../../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';
import {
  CarUpdateOrInsertEndpointService,
  CarUpdateOrInsertRequest
} from '../../../../../endpoints/car-endpoints/car-update-or-insert-endpoint.service';
import {
  CityGetAll1EndpointService,
  CityGetAll1Response
} from '../../../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import {
  ManufacturerGetAllEndpointService,
  ManufacturerGetAllResponse
} from '../../../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService,
  CarModelGetByManufacturerResponse
} from '../../../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import { FuelType, TransmissionType } from '../../../../../services/car-services/car-enums';
import {
  BodyTypeGetAllEndpointService, BodyTypeGetAllResponse
} from '../../../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';

interface EnumOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-car-form',
  templateUrl: './car-form.component.html',
  styleUrls: ['./car-form.component.scss']
})
export class CarFormComponent implements OnInit {
  carId: number = 0;
  isLoading: boolean = false;
  errorMessage: string = '';
  maxYear: number = new Date().getFullYear() + 1;

  cities: CityGetAll1Response[] = [];
  manufacturers: ManufacturerGetAllResponse[] = [];
  models: CarModelGetByManufacturerResponse[] = [];
  bodyTypes: BodyTypeGetAllResponse[] | undefined = [];

  car: CarGetByIdResponse = {
    id: 0,
    name: '',
    year: new Date().getFullYear(),
    engineCapacity: 0,
    fuelType: FuelType.Petrol, // Default enum value
    transmission: TransmissionType.Manual, // Default enum value
    doors: 4, // Default reasonable value
    fuelConsumption: 0,
    mileage: 0,
    color: '',
    hasServiceHistory: false,
    bodyType: {
      id: 0, // Use 0 instead of null
      name: ''
    },
    location: {
      cityId: 0, // Use 0 instead of null
      cityName: '',
      countryName: ''
    },
    model: {
      id: 0, // Use 0 instead of null
      name: '',
      manufacturer: {
        id: 0, // Use 0 instead of null
        name: '',
        country: ''
      }
    }
  };

  fuelTypeOptions: EnumOption[] = Object.entries(FuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  transmissionTypeOptions: EnumOption[] = Object.entries(TransmissionType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      value: value as number,
      label: key
    }));

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private snackBar: MatSnackBar,
    private carGetByIdService: CarGetByIdEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    private cityService: CityGetAll1EndpointService,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService
  ) { }

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.carId = Number(idParam);
      await this.loadInitialData(true);
    } else {
      await this.loadInitialData(false);
    }
  }

  private async loadInitialData(isEditMode: boolean = false): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      await Promise.all([
        this.loadCities(),
        this.loadManufacturers(),
        this.loadBodyTypes()
      ]);

      if (isEditMode && this.carId) {
        await this.loadCarData();
      }
    } catch (error) {
      this.handleError('Error loading initial data', error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadCities(): Promise<void> {
    try {
      const data = await this.cityService.handleAsync().toPromise();
      if (data) {
        this.cities = data;
      }
    } catch (error) {
      this.handleError('Error loading cities', error);
    }
  }

  private async loadManufacturers(): Promise<void> {
    try {
      const data = await this.manufacturerService.handleAsync().toPromise();
      if (data) {
        this.manufacturers = data;
      }
    } catch (error) {
      this.handleError('Error loading manufacturers', error);
    }
  }

  private async loadModels(manufacturerId: number): Promise<void> {
    try {
      const data = await this.modelService.handleAsync(manufacturerId).toPromise();
      if (data) {
        this.models = data;
      }
    } catch (error) {
      this.handleError('Error loading models', error);
    }
  }

  async loadBodyTypes(): Promise<void> {
    try {
      this.bodyTypes = await this.bodyTypeService.handleAsync().toPromise();
    } catch (error) {
      this.handleError('Error loading body types', error);
    }
  }

  async onManufacturerChange(manufacturerId: number): Promise<void> {
    if (!manufacturerId) {
      this.models = [];
      this.car.model.id = 0;
      return;
    }

    try {
      await this.loadModels(manufacturerId);
      this.car.model.id = 0;
    } catch (error) {
      this.handleError('Error loading models', error);
    }
  }

  private async loadCarData(): Promise<void> {
    try {
      const data = await this.carGetByIdService
        .handleAsync(this.carId)
        .toPromise();

      if (data) {
        const foundCity = this.cities.find(c => c.name === data.location.cityName);
        const cityId = foundCity!.id ?? null;

        this.car = {
          ...data,
          location: {
            cityId: cityId,
            cityName: data.location.cityName,
            countryName: data.location.countryName
          },
          bodyType: {
            id: data.bodyType.id,
            name: data.bodyType.name
          },
          model: {
            id: data.model.id,
            name: data.model.name,
            manufacturer: {
              id: data.model.manufacturer.id,
              name: data.model.manufacturer.name,
              country: data.model.manufacturer.country
            }
          }
        };

        if (this.car.model.manufacturer.id) {
          await this.loadModels(this.car.model.manufacturer.id);
        }
      }
    } catch (error) {
      this.handleError('Error loading car data', error);
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = `${message}${error?.error?.message ? ': ' + error.error.message :
      error?.message ? ': ' + error.message :
        ': An unexpected error occurred'}`;
    this.showSnackBar(this.errorMessage);
  }

  async updateCar(): Promise<void> {
    if (!this.canSubmitForm()) {
      this.showSnackBar('Please fill in all required fields correctly');
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';

      const request: CarUpdateOrInsertRequest = {
        id: this.carId !== 0 ? this.carId : undefined,
        name: this.car.name.trim(),
        year: Number(this.car.year),
        engineCapacity: Number(this.car.engineCapacity),
        fuelType: Number(this.car.fuelType),
        transmission: Number(this.car.transmission),
        doors: Number(this.car.doors),
        fuelConsumption: Number(this.car.fuelConsumption),
        mileage: Number(this.car.mileage),
        color: this.car.color.trim(),
        hasServiceHistory: Boolean(this.car.hasServiceHistory),
        bodyID: Number(this.car.bodyType.id),
        cityID: Number(this.car.location.cityId),
        modelID: Number(this.car.model.id)
      };

      await this.carUpdateService.handleAsync(request)
        .pipe(finalize(() => this.isLoading = false))
        .toPromise();

      this.showSnackBar(
        this.carId !== 0 ? 'Car updated successfully' : 'Car created successfully'
      );
      this.router.navigate(['/admin/cars']);
    } catch (error: any) {
      this.handleError('Error updating car', error);
    }
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-notification']
    });
  }

  goBack(): void {
    this.location.back();
  }

  isFieldValid(value: any): boolean {
    if (typeof value === 'number') {
      return value !== null && !isNaN(value);
    }
    if (typeof value === 'string') {
      return value !== null && value.trim() !== '';
    }
    if (typeof value === 'boolean') {
      return true;
    }
    return value !== null && value !== undefined;
  }

  private validateIds(): boolean {
    const bodyTypeId = Number(this.car.bodyType?.id);
    const cityId = Number(this.car.location?.cityId);
    const modelId = Number(this.car.model?.id);

    if (!bodyTypeId || bodyTypeId <= 0) {
      this.errorMessage = 'Please select a valid body type';
      return false;
    }

    if (!cityId || cityId <= 0) {
      this.errorMessage = 'Please select a valid city';
      return false;
    }

    if (!modelId || modelId <= 0) {
      this.errorMessage = 'Please select a valid model';
      return false;
    }

    return true;
  }

  canSubmitForm(): boolean {
    if (!this.validateIds()) {
      return false;
    }

    const formValues = {
      name: this.car.name?.trim(),
      year: this.car.year,
      engineCapacity: this.car.engineCapacity,
      fuelType: this.car.fuelType,
      transmission: this.car.transmission,
      doors: this.car.doors,
      fuelConsumption: this.car.fuelConsumption,
      mileage: this.car.mileage,
      color: this.car.color?.trim(),
      bodyTypeId: this.car.bodyType?.id,
      cityId: this.car.location?.cityId,
      modelId: this.car.model?.id
    };

    const validations = {
      name: this.isFieldValid(formValues.name),
      year: this.isFieldValid(formValues.year),
      engineCapacity: this.isFieldValid(formValues.engineCapacity),
      fuelType: formValues.fuelType !== null && formValues.fuelType !== undefined,
      transmission: formValues.transmission !== null && formValues.transmission !== undefined,
      doors: this.isFieldValid(formValues.doors),
      fuelConsumption: this.isFieldValid(formValues.fuelConsumption),
      mileage: this.isFieldValid(formValues.mileage),
      color: this.isFieldValid(formValues.color),
      bodyTypeId: this.isFieldValid(formValues.bodyTypeId),
      cityId: this.isFieldValid(formValues.cityId),
      modelId: this.isFieldValid(formValues.modelId)
    };

    const invalidFields = Object.entries(validations)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      this.errorMessage = `Please fill in the following fields: ${invalidFields.join(', ')}`;
      return false;
    }

    const numericValidations = {
      engineCapacity: formValues.engineCapacity >= 0 && formValues.engineCapacity <= 10,
      fuelConsumption: formValues.fuelConsumption >= 0 && formValues.fuelConsumption <= 30,
      mileage: formValues.mileage >= 0 && formValues.mileage <= 999999,
      doors: formValues.doors >= 2 && formValues.doors <= 8,
      year: formValues.year >= 1900 && formValues.year <= new Date().getFullYear() + 1
    };

    const invalidNumericFields = Object.entries(numericValidations)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidNumericFields.length > 0) {
      this.errorMessage = `Please enter valid values for: ${invalidNumericFields.join(', ')}`;
      return false;
    }

    return true;
  }
}
