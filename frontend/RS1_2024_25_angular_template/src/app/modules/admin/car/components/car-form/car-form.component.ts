import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  styleUrls: ['./car-form.component.css']
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
    fuelType: FuelType.Petrol,
    transmission: TransmissionType.Manual,
    doors: 4,
    fuelConsumption: 0,
    mileage: 0,
    color: '',
    hasServiceHistory: false,
    bodyType: {
      id: 1,
      name: 'Sedan'
    },
    location: {
      cityId: 0,
      cityName: '',
      countryName: ''
    },
    model: {
      id: 0,
      name: '',
      manufacturer: {
        id: 0,
        name: '',
        country: ''
      }
    }
  };

  // Enum options for dropdowns
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
      await this.loadInitialData(true); // Pass flag to indicate edit mode
    } else {
      await this.loadInitialData(false);
    }
  }

  private async loadInitialData(isEditMode: boolean = false): Promise<void> {
    try {
      this.isLoading = true;
      this.errorMessage = '';

      // First load all reference data
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
        console.log('Loaded cities:', {
          cities: this.cities,
          count: this.cities.length
        });
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
      console.log('Loaded body types:', this.bodyTypes);
    } catch (error) {
      console.error('Error loading body types:', error);
      this.errorMessage = 'Failed to load body types';
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
      // Reset model selection when manufacturer changes
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
        console.log('Loaded car data:', data);

        // Find the city ID from the cities array based on the city name
        const foundCity = this.cities.find(c => c.name === data.location.cityName);
        const cityId = foundCity?.id ?? 0; // Provide a default value of 0

        console.log('Found city:', {
          cityName: data.location.cityName,
          foundCity,
          cityId
        });

        // Create a new car object with the loaded data
        this.car = {
          ...data,
          location: {
            cityId: cityId, // Now cityId is guaranteed to be a number
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

        // Load models for the selected manufacturer
        if (this.car.model.manufacturer.id) {
          await this.loadModels(this.car.model.manufacturer.id);
        }

        console.log('Processed car data:', this.car);
      }
    } catch (error) {
      this.handleError('Error loading car data', error);
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    setTimeout(() => {
      this.errorMessage = `${message}${error?.error?.message ? ': ' + error.error.message :
        error?.message ? ': ' + error.message :
          ': An unexpected error occurred'}`;
    });
  }

  async updateCar(): Promise<void> {
    try {
      if (!this.canSubmitForm()) {
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      console.log('Preparing update with car state:', {
        bodyType: this.car.bodyType,
        location: this.car.location,
        model: this.car.model
      });

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

      console.log('Submitting request:', request);

      await this.carUpdateService.handleAsync(request).toPromise();
      this.router.navigate(['/admin/cars']);
    } catch (error: any) {
      this.handleError('Error updating car', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Helper method to get enum display name
  getEnumDisplayName(enumObj: any, value: number): string {
    return Object.entries(enumObj)
      .find(([key, val]) => val === value)?.[0] || '';
  }

  isFieldValid(value: any): boolean {
    // Special handling for numeric fields where 0 is valid
    if (typeof value === 'number') {
      return value !== null && !isNaN(value);
    }
    // Handle string values
    if (typeof value === 'string') {
      return value !== null && value.trim() !== '';
    }
    // Handle boolean values
    if (typeof value === 'boolean') {
      return true;
    }
    return value !== null && value !== undefined;
  }

  private validateIds(): boolean {
    const bodyTypeId = Number(this.car.bodyType?.id);
    const cityId = Number(this.car.location?.cityId);
    const modelId = Number(this.car.model?.id);

    console.log('Validating IDs:', { bodyTypeId, cityId, modelId });

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

    console.log('Validating form values:', formValues);

    // Check each field individually and log if invalid
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

    console.log('Field validations:', validations);

    // Check if any validations failed
    const invalidFields = Object.entries(validations)
      .filter(([_, isValid]) => !isValid)
      .map(([field]) => field);

    if (invalidFields.length > 0) {
      console.log('Invalid fields:', invalidFields);
      this.errorMessage = `Please fill in the following fields: ${invalidFields.join(', ')}`;
      return false;
    }

    // Additional validation for numeric fields
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
      console.log('Invalid numeric fields:', invalidNumericFields);
      this.errorMessage = `Please enter valid values for: ${invalidNumericFields.join(', ')}`;
      return false;
    }

    return true;
  }

  // Make enums available to template
  protected readonly FuelType = FuelType;
  protected readonly TransmissionType = TransmissionType;
  protected readonly Date = Date;
}
