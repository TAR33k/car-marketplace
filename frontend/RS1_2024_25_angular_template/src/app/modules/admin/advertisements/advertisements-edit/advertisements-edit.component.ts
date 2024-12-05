import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AdvertisementGetByIdEndpointService,
  AdvertGetByIdResponse, AdvertImageResponse
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
  CarUpdateOrInsertEndpointService
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
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {
  AdvertGetAllRequest, AdvertGetAllResponse,
  AdvertisementGetAllEndpointService
} from '../../../../endpoints/advertisement-endpoints/advertisement-get-all-endpoint.service';
import {
  ManufacturerGetAllEndpointService, ManufacturerGetAllResponse
} from '../../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService, CarModelGetByManufacturerResponse
} from '../../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import {
  CarGetByIdEndpointService
} from '../../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';

interface LoadingStates {
  cars: boolean;
  cities: boolean;
  models: boolean;
  bodyTypes: boolean;
  advertisement: boolean;
  saving: boolean;
}

interface Advertisement {
  id: number;
  title: string;
  description: string;
  condition: string;
  price: number;
  listingDate: Date;
  expirationDate?: Date;
  viewCount: number;
  status: string;
  carId: number;  // lowercase for internal use
  carName: string;
  userId: number;  // lowercase for internal use
  userName: string;
  images: AdvertImageResponse[];
}

interface CarWithAdvertisement extends CarGetAllResponse {
  isInUse?: boolean;
}

interface CarModel {
  id: number;
  name: string;
  manufacturer?: CarManufacturer;
}

interface CarManufacturer {
  id: number;
  name: string;
}

interface CarGetByIdResponse {
  id: number;
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  doors: number;
  fuelConsumption: number;
  mileage: number;
  color: string;
  hasServiceHistory: boolean;
  bodyID: number;
  cityID: number;
  location?: {
    cityID: number;
    cityName: string;
    countryName: string;
  };
  model: {
    id: number;
    name: string;
    manufacturer: {
      id: number;
      name: string;
    };
  };
}

interface CarUpdateOrInsertRequest {
  id?: number;  // Add this line
  name: string;
  year: number;
  engineCapacity: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  doors: number;
  fuelConsumption: number;
  mileage: number;
  color: string;
  hasServiceHistory: boolean;
  bodyID: number;
  cityID: number;
  modelID: number;
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
  selectedManufacturerId: number = 0;
  manufacturers: ManufacturerGetAllResponse[] = [];
  models: CarModelGetByManufacturerResponse[] = [];
  bodyTypes: BodyTypeGetAllResponse[] = [];
  cars: CarWithAdvertisement[] = [];
  currentCar: CarGetByIdResponse | null = null;
  currentYear: number = new Date().getFullYear();

  advertisement: Advertisement = {
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

  readonly fuelTypes = Object.values(FuelType).filter(value => typeof value === 'number') as FuelType[];
  readonly transmissionTypes = Object.values(TransmissionType).filter(value => typeof value === 'number') as TransmissionType[];
  readonly conditions = Object.values(VehicleCondition).filter(value => typeof value === 'string');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private advertisementGetByIdService: AdvertisementGetByIdEndpointService,
    private advertisementUpdateService: AdvertisementUpdateOrInsertEndpointService,
    private carGetAllService: CarGetAllEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    private carGetByIdService: CarGetByIdEndpointService,
    private carImageSetPrimaryService: CarImageSetPrimaryEndpointService,
    private carImageDeleteService: CarImageDeleteEndpointService,
    private cityService: CityGetAll1EndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService,
    private advertisementGetAllService: AdvertisementGetAllEndpointService,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.advertisementId = idParam ? Number(idParam) : 0;

    if (this.advertisementId === 0) {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      defaultDate.setHours(0, 0, 0, 0);
      this.advertisement.expirationDate = defaultDate;
      this.advertisement.condition = VehicleCondition[VehicleCondition.Used] as string;
    }

    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    try {
      await Promise.all([
        this.loadCars(),
        this.loadCities(),
        this.loadBodyTypes(),
        this.loadManufacturers()
      ]);

      if (this.advertisementId) {
        await this.loadAdvertisementData();
      }
    } catch (error) {
      this.handleError('Error loading initial data', error);
    }
  }

  private async loadAdvertisementData(): Promise<void> {
    try {
      this.loading.advertisement = true;

      if (this.cities.length === 0) {
        await this.loadCities();
      }

      const data = await this.advertisementGetByIdService
        .handleAsync(this.advertisementId)
        .toPromise();

      if (data) {
        this.advertisement = {
          ...this.advertisement,
          id: data.id,
          title: data.title,
          description: data.description,
          condition: this.getConditionString(data.condition),
          price: data.price,
          listingDate: new Date(data.listingDate),
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
          viewCount: data.viewCount,
          status: data.status,
          carId: data.carID,
          carName: data.carName,
          userId: data.userID,
          userName: data.userName,
          images: data.images || []

        };

        if (data.carID) {
          await this.loadCarDetails(data.carID);
        }

        console.log('Loaded advertisement:', this.advertisement);
        console.log('Formatted date:', this.formatDateForInput(this.advertisement.expirationDate));

        if (this.advertisement.carId) {
          await this.loadCarDetails(this.advertisement.carId);
        }
      }
    } catch (error) {
      this.handleError('Error loading advertisement data', error);
    } finally {
      this.loading.advertisement = false;
    }
  }

  private async loadCarDetails(carId: number): Promise<void> {
    try {
      const carData = await this.carGetByIdService.handleAsync(carId).toPromise();
      console.log('Loaded car data:', carData);

      if (carData && 'location' in carData) {  // Check if location exists
        const defaultCar = this.initializeCurrentCar();

        this.currentCar = {
          id: carData.id,
          name: carData.name,
          year: carData.year,
          engineCapacity: carData.engineCapacity,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          doors: carData.doors,
          fuelConsumption: carData.fuelConsumption,
          mileage: carData.mileage,
          color: carData.color,
          hasServiceHistory: carData.hasServiceHistory,
          bodyID: carData.bodyType?.id || defaultCar.bodyID,
          cityID: (carData as any).location?.cityID || defaultCar.cityID,  // Cast to any to access location
          model: {
            id: carData.model?.id ?? defaultCar.model.id,
            name: carData.model?.name ?? defaultCar.model.name,
            manufacturer: {
              id: carData.model?.manufacturer?.id ?? 0,
              name: carData.model?.manufacturer?.name ?? ''
            }
          }
        };

        // Add debug logging
        console.log('Location from car data:', (carData as any).location);
        console.log('City ID from location:', (carData as any).location?.cityID);
        console.log('Set currentCar:', this.currentCar);

        this.advertisement.carName = this.currentCar.name;

        if (this.currentCar.model.manufacturer?.id) {
          this.selectedManufacturerId = this.currentCar.model.manufacturer.id;
          await this.loadModels(this.selectedManufacturerId);
        }
      }
    } catch (error) {
      this.handleError('Error loading car details', error);
      this.currentCar = this.initializeCurrentCar();
    }
  }

  private initializeCurrentCar(): CarGetByIdResponse {
    return {
      id: 0,
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
      model: {
        id: 0,
        name: '',
        manufacturer: {
          id: 0,
          name: ''
        }
      }
    };
  }

  async updateCarDetails(): Promise<void> {
    try {
      if (!this.currentCar || !this.validateCarDetails()) {
        return;
      }

      this.loading.saving = true;
      this.errorMessage = '';

      const carUpdateRequest: CarUpdateOrInsertRequest = {
        id: this.currentCar.id, // Add ID for update
        name: this.currentCar.name,
        year: this.currentCar.year,
        engineCapacity: this.currentCar.engineCapacity,
        fuelType: this.currentCar.fuelType,
        transmission: this.currentCar.transmission,
        doors: this.currentCar.doors,
        fuelConsumption: this.currentCar.fuelConsumption,
        mileage: this.currentCar.mileage,
        color: this.currentCar.color,
        hasServiceHistory: this.currentCar.hasServiceHistory,
        bodyID: this.currentCar.bodyID,
        cityID: this.currentCar.cityID,
        modelID: this.currentCar.model?.id || 0
      };

      const response = await this.carUpdateService.handleAsync(carUpdateRequest).toPromise();

      if (response) {
        // Reload car details to get updated data
        await this.loadCarDetails(this.currentCar.id);
        this.errorMessage = 'Car details updated successfully';
      }
    } catch (error) {
      this.handleError('Error updating car details', error);
    } finally {
      this.loading.saving = false;
    }
  }

  private validateCarDetails(): boolean {
    if (!this.currentCar || this.advertisementId === 0) {
      return true; // Skip validation if no car is being edited or it's a new advertisement
    }

    const validations = [
      { condition: !this.currentCar.name?.trim(), message: 'Please enter a car name' },
      { condition: !this.currentCar.year || this.currentCar.year < 1900 || this.currentCar.year > this.currentYear,
        message: 'Please enter a valid year' },
      { condition: !this.currentCar.engineCapacity || this.currentCar.engineCapacity <= 0,
        message: 'Please enter a valid engine capacity' },
      { condition: this.currentCar.fuelType === undefined,
        message: 'Please select a fuel type' },
      { condition: this.currentCar.transmission === undefined,
        message: 'Please select a transmission type' },
      { condition: !this.currentCar.model?.id,
        message: 'Please select a model' },
      { condition: !this.currentCar.bodyID,
        message: 'Please select a body type' },
      { condition: !this.currentCar.cityID,
        message: 'Please select a city' }
    ];

    for (const validation of validations) {
      if (validation.condition) {
        this.errorMessage = validation.message;
        return false;
      }
    }

    return true;
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

  private async loadCars(): Promise<void> {
    try {
      this.loading.cars = true;

      const carsRequest: CarGetAllRequest = {
        pageNumber: 1,
        pageSize: 1000
      };

      const advertsRequest: AdvertGetAllRequest = {
        pageNumber: 1,
        pageSize: 1000
      };

      const [carsResponse, advertsResponse] = await Promise.all([
        this.carGetAllService.handleAsync(carsRequest).toPromise(),
        this.advertisementGetAllService.handleAsync(advertsRequest).toPromise()
      ]);

      const carsData = (carsResponse as any)?.dataItems || [];

      if (Array.isArray(carsData) && carsData.length > 0) {
        const usedCarIds = new Set(
          advertsResponse?.dataItems
            ?.filter((ad: AdvertGetAllResponse) => ad.id !== this.advertisementId)
            ?.map((ad: AdvertGetAllResponse) => {
              const car = carsData.find((c: CarGetAllResponse) =>
                c.name === ad.carName
              );
              return car?.id;
            })
            .filter((id: number | undefined): id is number => id !== undefined)
        );

        this.cars = carsData
          .map((car: CarGetAllResponse): CarWithAdvertisement => ({
            ...car,
            isInUse: usedCarIds.has(car.id)
          }))
          .filter((car: CarWithAdvertisement): boolean => !car.isInUse || (this.advertisement?.carName === car.name));
      } else {
        this.cars = [];
      }
    } catch (error) {
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
      }
    } catch (error) {
      this.handleError('Error loading cities', error);
    } finally {
      this.loading.cities = false;
    }
  }

  private async loadModels(manufacturerId: number): Promise<void> {
    try {
      this.loading.models = true;
      const data = await this.modelService.handleAsync(manufacturerId).toPromise();
      if (data) {
        this.models = data;
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

    if (!this.newCar.name?.trim()) {
      this.errorMessage = 'Please enter a car name';
      return false;
    }

    if (!this.newCar.year || this.newCar.year < 1900 || this.newCar.year > new Date().getFullYear() + 1) {
      this.errorMessage = 'Please enter a valid year';
      return false;
    }

    if (!this.newCar.engineCapacity || this.newCar.engineCapacity <= 0 || this.newCar.engineCapacity > 10) {
      this.errorMessage = 'Please enter a valid engine capacity (0-10L)';
      return false;
    }

    if (this.newCar.fuelType === undefined) {
      this.errorMessage = 'Please select a fuel type';
      return false;
    }

    if (this.newCar.transmission === undefined) {
      this.errorMessage = 'Please select a transmission type';
      return false;
    }

    if (!this.newCar.doors || this.newCar.doors < 2 || this.newCar.doors > 8) {
      this.errorMessage = 'Please enter a valid number of doors (2-8)';
      return false;
    }

    if (!this.newCar.fuelConsumption || this.newCar.fuelConsumption <= 0 || this.newCar.fuelConsumption > 30) {
      this.errorMessage = 'Please enter a valid fuel consumption (0-30 L/100km)';
      return false;
    }

    if (!this.newCar.mileage || this.newCar.mileage < 0) {
      this.errorMessage = 'Please enter a valid mileage';
      return false;
    }

    if (!this.newCar.color?.trim()) {
      this.errorMessage = 'Please enter a color';
      return false;
    }

    if (!this.newCar.bodyID) {
      this.errorMessage = 'Please select a body type';
      return false;
    }

    if (!this.newCar.cityID) {
      this.errorMessage = 'Please select a city';
      return false;
    }

    if (!this.newCar.modelID) {
      this.errorMessage = 'Please select a model';
      return false;
    }

    return true;
  }

  async updateAdvertisement(): Promise<void> {
    try {
      if (!this.validateAdvertisement() || !this.validateNewCar()) {
        return;
      }

      this.loading.saving = true;
      this.errorMessage = '';

      let carId = this.advertisement.carId;

      // Update existing car details if editing an advertisement
      if (this.advertisementId !== 0 && this.currentCar) {
        const carUpdateRequest: CarUpdateOrInsertRequest = {
          id: this.currentCar.id,
          name: this.currentCar.name,
          year: this.currentCar.year,
          engineCapacity: this.currentCar.engineCapacity,
          fuelType: this.currentCar.fuelType,
          transmission: this.currentCar.transmission,
          doors: this.currentCar.doors,
          fuelConsumption: this.currentCar.fuelConsumption,
          mileage: this.currentCar.mileage,
          color: this.currentCar.color,
          hasServiceHistory: this.currentCar.hasServiceHistory,
          bodyID: this.currentCar.bodyID,
          cityID: this.currentCar.cityID,
          modelID: this.currentCar.model?.id ?? 0
        };

        const carResponse = await this.carUpdateService.handleAsync(carUpdateRequest).toPromise();
        if (carResponse?.id) {
          carId = carResponse.id;
        } else {
          throw new Error('Failed to update car details');
        }
      }

      // Create new car if needed
      if (this.isNewCar) {
        const newCarResponse = await this.carUpdateService.handleAsync(this.newCar).toPromise();
        if (newCarResponse?.id) {
          carId = newCarResponse.id;
        } else {
          throw new Error('Failed to create new car');
        }
      }

      const advertRequest: AdvertUpdateOrInsertRequest = {
        ID: this.advertisementId || undefined,
        Title: this.advertisement.title.trim(),
        Description: this.advertisement.description?.trim() ?? '',
        Condition: Number(VehicleCondition[this.advertisement.condition as keyof typeof VehicleCondition]),
        Price: this.advertisement.price,
        CarID: carId,
        ExpirationDate: this.advertisement.expirationDate
      };

      await this.advertisementUpdateService.handleAsync(advertRequest).toPromise();
      this.router.navigate(['/admin/advertisements']);
    } catch (error) {
      this.handleError('Error saving advertisement', error);
    } finally {
      this.loading.saving = false;
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    this.errorMessage = `${message}: ${
      error?.error?.message || error?.message || 'Unknown error occurred'
    }`;
  }

  private getConditionString(condition: string | number): string {
    const conditionNumber = Number(condition);
    if (isNaN(conditionNumber) || !VehicleCondition[conditionNumber]) {
      return VehicleCondition[VehicleCondition.Used];
    }
    return VehicleCondition[conditionNumber];
  }

  onExpirationDateChange(dateStr: string): void {
    this.advertisement.expirationDate = dateStr ? new Date(dateStr) : undefined;
  }

  // Function to format date for input
  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Function to toggle between new and existing car modes
  toggleCarMode(): void {
    this.isNewCar = !this.isNewCar;
    if (!this.isNewCar) {
      this.advertisement.carId = 0;
    } else {
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

  // Function to handle manufacturer change
  async onManufacturerChange(manufacturerId: number): Promise<void> {
    if (!manufacturerId) {
      this.models = [];
      this.newCar.modelID = 0;
      return;
    }

    try {
      await this.loadModels(manufacturerId);
      this.newCar.modelID = 0; // Reset model selection
    } catch (error) {
      this.handleError('Error loading models', error);
    }
  }

  // Function to set primary image
  setPrimaryImage(imageId: number): void {
    if (this.loading.saving) return;

    this.loading.saving = true;
    this.errorMessage = '';

    this.carImageSetPrimaryService.handleAsync({ imageId }).subscribe({
      next: () => {
        this.loadAdvertisementData();
      },
      error: (error) => this.handleError('Error setting primary image', error),
      complete: () => {
        this.loading.saving = false;
      }
    });
  }

  // Function to delete an image
  deleteImage(imageId: number): void {
    if (this.loading.saving) return;

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.loading.saving = true;
    this.errorMessage = '';

    this.carImageDeleteService.handleAsync(imageId).subscribe({
      next: () => {
        if (this.advertisement.images) {
          this.advertisement.images = this.advertisement.images.filter(img => img.id !== imageId);
        }
      },
      error: (error) => this.handleError('Error deleting image', error),
      complete: () => {
        this.loading.saving = false;
      }
    });
  }

  getFuelTypeName(fuelType: FuelType | undefined): string {
    if (fuelType === undefined) return '';
    return FuelType[fuelType] || 'Unknown';
  }

  getTransmissionTypeName(transmissionType: TransmissionType | undefined): string {
    if (transmissionType === undefined) return '';
    return TransmissionType[transmissionType] || 'Unknown';
  }

  getMileageDisplay(mileage: number | undefined): string {
    if (mileage === undefined) return '';
    return `${mileage} km`;
  }
}
