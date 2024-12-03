import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdvertisementGetByIdEndpointService,
  AdvertGetByIdResponse
} from '../../../../endpoints/advertisement-endpoints/advertisement-get-by-id-endpoint.service';
import {
  AdvertisementUpdateOrInsertEndpointService,
  AdvertUpdateOrInsertRequest
} from '../../../../endpoints/advertisement-endpoints/advertisement-update-or-insert-endpoint.service';
import {
  CarGetAllEndpointService, CarGetAllRequest,
  CarGetAllResponse
} from '../../../../endpoints/car-endpoints/car-get-all-endpoint.service';
import {
  CarUpdateOrInsertEndpointService,
  CarUpdateOrInsertRequest,
  CarUpdateOrInsertResponse
} from '../../../../endpoints/car-endpoints/car-update-or-insert-endpoint.service';
import {
  CarImageSetPrimaryEndpointService
} from '../../../../endpoints/car-image-endpoints/car-image-set-primary-endpoint.service';
import {
  CarImageDeleteEndpointService
} from '../../../../endpoints/car-image-endpoints/car-image-delete-endpoint.service';
import { FuelType, TransmissionType, VehicleCondition } from '../../../../services/car-services/car-enums';
import {
  CityGetAll1EndpointService,
  CityGetAll1Response
} from '../../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import {
  CarModelGetAllEndpointService,
  CarModelGetAllResponse
} from '../../../../endpoints/car-model-endpoints/car-model-get-all-endpoint.service';
import {
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {MyPagedList, MyPagedRequest} from '../../../../helper/my-paged-request';

interface LoadingStates {
  cars: boolean;
  cities: boolean;
  models: boolean;
  bodyTypes: boolean;
  advertisement: boolean;
  saving: boolean;
}

interface CarPagedResponse extends MyPagedList<CarGetAllResponse> {
  dataItems: CarGetAllResponse[];  // Override data with dataItems
}

@Component({
  selector: 'app-advertisements-edit',
  templateUrl: './advertisements-edit.component.html',
  styleUrls: ['./advertisements-edit.component.css']
})
export class AdvertisementsEditComponent implements OnInit {
  advertisementId: number = 0;
  isNewCar: boolean = false;
  errorMessage: string = '';

  loading: LoadingStates = {
    cars: false,
    cities: false,
    models: false,
    bodyTypes: false,
    advertisement: false,
    saving: false
  };

  get isLoading(): boolean {
    return Object.values(this.loading).some(state => state);
  }

  cities: CityGetAll1Response[] = [];
  models: CarModelGetAllResponse[] = [];
  bodyTypes: BodyTypeGetAllResponse[] = [];
  cars: CarGetAllResponse[] = [];

  advertisement: AdvertGetByIdResponse = {
    id: 0,
    title: '',
    description: '',
    condition: '',
    price: 0,
    listingDate: new Date(),
    expirationDate: undefined,
    carId: 0,
    carName: '',
    userId: 0,
    userName: '',
    status: '',
    viewCount: 0,
    images: []
  };

  newCar: CarUpdateOrInsertRequest = {
    name: '',
    year: new Date().getFullYear(),
    engineCapacity: 0,
    fuelType: FuelType.Petrol,
    transmission: TransmissionType.Manual,
    doors: 4,
    fuelConsumption: 0,
    mileage: 0,
    color: '',
    hasServiceHistory: false,
    bodyID: 0,
    cityID: 0,
    modelID: 0
  };

  readonly fuelTypes = Object.entries(FuelType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => value as FuelType);

  readonly transmissionTypes = Object.entries(TransmissionType)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => value as TransmissionType);

  readonly conditions = Object.values(VehicleCondition)
    .filter(value => typeof value === 'string');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advertisementGetByIdService: AdvertisementGetByIdEndpointService,
    private advertisementUpdateService: AdvertisementUpdateOrInsertEndpointService,
    private carGetAllService: CarGetAllEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    private carImageSetPrimaryService: CarImageSetPrimaryEndpointService,
    private carImageDeleteService: CarImageDeleteEndpointService,
    private cityService: CityGetAll1EndpointService,
    private modelService: CarModelGetAllEndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      // Load all reference data in parallel
      await Promise.all([
        this.loadCars(),
        this.loadCities(),
        this.loadModels(),
        this.loadBodyTypes()
      ]);

      // Load advertisement data if editing
      const idParam = this.route.snapshot.paramMap.get('id');
      if (idParam) {
        this.advertisementId = Number(idParam);
        await this.loadAdvertisementData();
      }
    } catch (error) {
      this.handleError('Error loading initial data', error);
    }
  }

  private async loadAdvertisementData(): Promise<void> {
    try {
      this.loading.advertisement = true;
      const data = await this.advertisementGetByIdService
        .handleAsync(this.advertisementId)
        .toPromise();
      if (data) {
        this.advertisement = data;
        console.log('Loaded advertisement:', this.advertisement);
      }
    } catch (error) {
      this.handleError('Error loading advertisement data', error);
    } finally {
      this.loading.advertisement = false;
    }
  }

  private async loadCars(): Promise<void> {
    try {
      this.loading.cars = true;
      const request: MyPagedRequest = {
        pageNumber: 1,
        pageSize: 100
      };

      console.log('Requesting cars with:', request);
      const response = await this.carGetAllService
        .handleAsync(request)
        .toPromise() as CarPagedResponse;

      console.log('Car service response:', response);

      if (response?.dataItems && Array.isArray(response.dataItems)) {
        this.cars = response.dataItems;
        console.log('Successfully loaded cars:', this.cars);
      } else {
        console.warn('Invalid cars response format:', response);
        this.cars = [];
      }
    } catch (error) {
      console.error('Error in loadCars:', error);
      this.handleError('Error loading cars', error);
      this.cars = [];
    } finally {
      this.loading.cars = false;
    }
  }

  private async loadCities(): Promise<void> {
    try {
      this.loading.cities = true;
      const data = await this.cityService.handleAsync().toPromise();
      if (data) {
        this.cities = data;
        console.log('Loaded cities:', this.cities);
      }
    } catch (error) {
      this.handleError('Error loading cities', error);
    } finally {
      this.loading.cities = false;
    }
  }

  private async loadModels(): Promise<void> {
    try {
      this.loading.models = true;
      const data = await this.modelService.handleAsync().toPromise();
      if (data) {
        this.models = data;
        console.log('Loaded models:', this.models);
      }
    } catch (error) {
      this.handleError('Error loading models', error);
    } finally {
      this.loading.models = false;
    }
  }

  private async loadBodyTypes(): Promise<void> {
    try {
      this.loading.bodyTypes = true;
      const data = await this.bodyTypeService.handleAsync().toPromise();
      if (data) {
        this.bodyTypes = data;
        console.log('Loaded body types:', this.bodyTypes);
      }
    } catch (error) {
      this.handleError('Error loading body types', error);
    } finally {
      this.loading.bodyTypes = false;
    }
  }

  private validateAdvertisement(): boolean {
    if (!this.advertisement.title?.trim()) {
      this.errorMessage = 'Please enter a title';
      return false;
    }
    if (!this.advertisement.price || this.advertisement.price <= 0) {
      this.errorMessage = 'Please enter a valid price';
      return false;
    }
    if (!this.advertisement.condition) {
      this.errorMessage = 'Please select a condition';
      return false;
    }
    if (!this.isNewCar && !this.advertisement.carId) {
      this.errorMessage = 'Please select a car';
      return false;
    }
    return true;
  }

  private validateNewCar(): boolean {
    if (!this.isNewCar) return true;

    const requiredFields = [
      { field: this.newCar.name, name: 'Car Name' },
      { field: this.newCar.year, name: 'Year' },
      { field: this.newCar.engineCapacity, name: 'Engine Capacity' },
      { field: this.newCar.fuelType, name: 'Fuel Type' },
      { field: this.newCar.transmission, name: 'Transmission' },
      { field: this.newCar.doors, name: 'Doors' },
      { field: this.newCar.fuelConsumption, name: 'Fuel Consumption' },
      { field: this.newCar.mileage, name: 'Mileage' },
      { field: this.newCar.color, name: 'Color' },
      { field: this.newCar.bodyID, name: 'Body Type' },
      { field: this.newCar.cityID, name: 'City' },
      { field: this.newCar.modelID, name: 'Model' }
    ];

    for (const { field, name } of requiredFields) {
      if (field === undefined || field === null || field === '' || field === 0) {
        this.errorMessage = `Please fill in the ${name} field`;
        return false;
      }
    }

    return true;
  }

  async updateAdvertisement(): Promise<void> {
    try {
      // Validate both advertisement and car if necessary
      if (!this.validateAdvertisement() || !this.validateNewCar()) {
        return;
      }

      this.loading.saving = true;
      this.errorMessage = '';

      let carId = this.advertisement.carId;

      // Create new car if needed
      if (this.isNewCar) {
        console.log('Creating new car:', this.newCar);
        const newCarResponse = await this.carUpdateService
          .handleAsync(this.newCar)
          .toPromise();

        if (newCarResponse?.id) {
          carId = newCarResponse.id;
          console.log('New car created with ID:', carId);
        } else {
          throw new Error('Failed to create new car');
        }
      }

      // Prepare and submit advertisement
      const advertRequest: AdvertUpdateOrInsertRequest = {
        ID: this.advertisementId || undefined,
        Title: this.advertisement.title.trim(),
        Description: this.advertisement.description?.trim(),
        Condition: Number(VehicleCondition[this.advertisement.condition as keyof typeof VehicleCondition]),
        Price: this.advertisement.price,
        CarID: carId,
        ExpirationDate: this.advertisement.expirationDate
      };

      console.log('Submitting advertisement:', advertRequest);

      await this.advertisementUpdateService
        .handleAsync(advertRequest)
        .toPromise();

      this.router.navigate(['/admin/advertisements']);
    } catch (error) {
      this.handleError('Error saving advertisement', error);
    } finally {
      this.loading.saving = false;
    }
  }

  toggleCarMode(): void {
    this.isNewCar = !this.isNewCar;
    console.log('Car mode toggled:', this.isNewCar ? 'New Car' : 'Existing Car');

    if (!this.isNewCar) {
      this.advertisement.carId = 0;
      console.log('Available cars:', this.cars);
    } else {
      // Reset new car form
      this.newCar = {
        name: '',
        year: new Date().getFullYear(),
        engineCapacity: 0,
        fuelType: FuelType.Petrol,
        transmission: TransmissionType.Manual,
        doors: 4,
        fuelConsumption: 0,
        mileage: 0,
        color: '',
        hasServiceHistory: false,
        bodyID: 0,
        cityID: 0,
        modelID: 0
      };
    }
    this.errorMessage = '';
  }

  setPrimaryImage(imageId: number): void {
    if (this.loading.saving) return;

    this.loading.saving = true;
    this.errorMessage = '';

    this.carImageSetPrimaryService.handleAsync({ imageId }).subscribe({
      next: () => {
        console.log(`Image ${imageId} set as primary`);
        this.loadAdvertisementData();
      },
      error: (error) => this.handleError('Error setting primary image', error),
      complete: () => {
        this.loading.saving = false;
      }
    });
  }

  deleteImage(imageId: number): void {
    if (this.loading.saving) return;

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.loading.saving = true;
    this.errorMessage = '';

    this.carImageDeleteService.handleAsync(imageId).subscribe({
      next: () => {
        console.log(`Image ${imageId} deleted`);
        if (this.advertisement.images) {
          this.advertisement.images = this.advertisement.images
            .filter(img => img.id !== imageId);
        }
      },
      error: (error) => this.handleError('Error deleting image', error),
      complete: () => {
        this.loading.saving = false;
      }
    });
  }

  canSubmitForm(): boolean {
    if (this.isLoading) {
      return false;
    }

    const hasRequiredAdvertFields =
      this.advertisement.title?.trim() &&
      this.advertisement.price > 0 &&
      this.advertisement.condition;

    if (!hasRequiredAdvertFields) {
      return false;
    }

    if (this.isNewCar) {
      return this.validateNewCar();
    } else {
      return this.advertisement.carId > 0;
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = `${message}: ${
      error?.error?.message || // API error message
      error?.message || // JavaScript error message
      'Unknown error occurred'
    }`;
  }

  // Helper methods for the template
  getCarName(carId: number): string {
    return this.cars.find(car => car.id === carId)?.name || '';
  }

  getCityName(cityId: number): string {
    return this.cities.find(city => city.id === cityId)?.name || '';
  }

  getModelName(modelId: number): string {
    return this.models.find(model => model.id === modelId)?.name || '';
  }

  getBodyTypeName(bodyTypeId: number): string {
    return this.bodyTypes.find(type => type.id === bodyTypeId)?.name || '';
  }

  getFuelTypeName(fuelType: FuelType): string {
    return FuelType[fuelType] as string;
  }

  getTransmissionTypeName(transmission: TransmissionType): string {
    return TransmissionType[transmission] as string;
  }
}
