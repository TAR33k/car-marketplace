import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {catchError, finalize, tap} from 'rxjs/operators';
import {
  AdvertisementGetByIdEndpointService, AdvertImageResponse
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
  CarImageSetPrimaryEndpointService, SetPrimaryRequest
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
import {ConfirmDialogComponent} from '../../../shared/confirm-dialog/confirm-dialog.component';
import {CarEditDialogComponent} from './car-edit-dialog/car-edit-dialog.component';
import {
  CarImageUploadEndpointService
} from '../../../../endpoints/car-image-endpoints/car-image-upload-endpoint.service';
import {
  AdvertisementImagesGetByIdEndpointService
} from '../../../../endpoints/car-image-endpoints/car-image-get-by-advert-endpoint.service';
import {MyConfig} from '../../../../my-config';
import {Observable, of} from 'rxjs';

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
  carId: number;
  carName: string;
  userId: number;
  userName: string;
  images: AdvertImageResponse[];
}

interface CarWithAdvertisement extends CarGetAllResponse {
  isInUse?: boolean;
}

interface CarModel {
  id: number;
  name: string;
  manufacturer: Manufacturer;
}

interface Manufacturer {
  id: number;
  name: string;
}

interface CurrentCar {
  id: number;
  name: string;
  model: CarModel;
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
  id?: number;
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

interface GroupedCars {
  [manufacturer: string]: CarWithAdvertisement[];
}

@Component({
  selector: 'app-advertisements-edit',
  templateUrl: './advertisements-edit.component.html',
  styleUrls: ['./advertisements-edit.component.scss']
})
export class AdvertisementsEditComponent implements OnInit {
  advertisementId: number = 0;
  errorMessage: string = '';
  advertisementForm!: FormGroup;
  carModeControl: FormControl = new FormControl(false);
  newCarForm!: FormGroup;
  availableCars: CarWithAdvertisement[] = [];
  groupedCars: GroupedCars = {};
  selectedCar: CarWithAdvertisement | null = null;
  selectedFiles: File[] = [];
  selectedImages: string[] = [];
  imageFiles: File[] = [];

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
  currentCar: CurrentCar | null = null;
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

  readonly fuelTypes = Object.values(FuelType).filter(value => typeof value === 'number') as FuelType[];
  readonly transmissionTypes = Object.values(TransmissionType).filter(value => typeof value === 'number') as TransmissionType[];
  readonly conditions = Object.values(VehicleCondition).filter(value => typeof value === 'string');

  isDragging = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private advertisementGetByIdService: AdvertisementGetByIdEndpointService,
    private advertisementUpdateService: AdvertisementUpdateOrInsertEndpointService,
    private carGetAllService: CarGetAllEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    private carGetByIdService: CarGetByIdEndpointService,
    private carImageSetPrimaryService: CarImageSetPrimaryEndpointService,
    private carImageDeleteService: CarImageDeleteEndpointService,
    private carImageUploadService: CarImageUploadEndpointService,
    private cityService: CityGetAll1EndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService,
    private advertisementGetAllService: AdvertisementGetAllEndpointService,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private advertisementImagesGetByIdService: AdvertisementImagesGetByIdEndpointService,
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.advertisementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      condition: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      expirationDate: [null, Validators.required],
      carId: [0, [Validators.required, Validators.min(1)]]
    });

    this.newCarForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      manufacturerId: [0, Validators.required],
      modelId: [0, Validators.required],
      year: [new Date().getFullYear(), [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear + 1)
      ]],
      engineCapacity: [0, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(10)
      ]],
      fuelType: [FuelType.Petrol, Validators.required],
      transmission: [TransmissionType.Manual, Validators.required],
      doors: [4, [
        Validators.required,
        Validators.min(2),
        Validators.max(8)
      ]],
      fuelConsumption: [0, [
        Validators.required,
        Validators.min(0),
        Validators.max(30)
      ]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      hasServiceHistory: [false],
      bodyId: [0, Validators.required],
      cityId: [0, Validators.required]
    });

    // Subscribe to car mode changes
    this.carModeControl.valueChanges.subscribe(isNewCar => {
      if (isNewCar) {
        // Switching to new car mode
        this.advertisementForm.get('carId')?.disable();
        this.advertisementForm.get('carId')?.setValue(0);
        this.selectedCar = null;
        this.newCarForm.enable();
      } else {
        // Switching to existing car mode
        this.advertisementForm.get('carId')?.enable();
        this.newCarForm.reset();
        this.newCarForm.disable();
      }
    });

    this.advertisementForm.get('carId')?.valueChanges.subscribe(carId => {
      if (carId) {
        this.onCarSelected(carId);
      } else {
        this.selectedCar = null;
      }
    });
  }

  async editCar(carId: number): Promise<void> {
    try {
      const carData = await this.carGetByIdService.handleAsync(carId).toPromise();

      if (carData) {
        const dialogRef = this.dialog.open(CarEditDialogComponent, {
          data: { car: carData },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(async (result) => {
          if (result) {
            // Refresh the car details
            await this.loadCarDetails(carId);
            this.snackBar.open('Car details updated successfully', 'Close', {
              duration: 3000
            });
          }
        });
      }
    } catch (error) {
      this.handleError('Error loading car details', error);
    }
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.advertisementId = idParam ? Number(idParam) : 0;

    if (this.advertisementId === 0) {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      defaultDate.setHours(0, 0, 0, 0);
      this.advertisementForm.patchValue({
        expirationDate: defaultDate,
        condition: VehicleCondition[VehicleCondition.Used]
      });
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
          listingDate: new Date(data.listingDate), // Convert to Date object
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
          viewCount: data.viewCount,
          status: data.status,
          carId: data.carID,
          carName: data.carName,
          userId: data.userID,
          userName: data.userName,
          images: data.images.map(image => ({
            id: image.id,
            url: this.formatImageUrl(image.url),  // Use the formatImageUrl function to handle URLs
            isPrimary: image.isPrimary
          })) || []
        };

        // Load advertisement images
        const images = await this.advertisementImagesGetByIdService.handleAsync(this.advertisementId).toPromise();

        // Ensure images is defined and map correctly
        this.advertisement.images = (images || []).map(image => ({
          id: image.id,
          url: this.formatImageUrl(image.imageUrl), // Use the formatImageUrl function here too
          isPrimary: image.isPrimary
        }));

        // Ensure there is always a primary image
        if (!this.advertisement.images.some(img => img.isPrimary)) {
          // If no primary image exists, set the first image as primary if available
          if (this.advertisement.images.length > 0) {
            this.advertisement.images[0].isPrimary = true; // Set the first image as primary
          }
        }

        // Call updateImageUrls to ensure frontend is updated with correct image URLs
        this.updateImageUrls(this.advertisement.images.map(img => img.url));

        // Patch form values with advertisement data
        this.advertisementForm.patchValue({
          title: this.advertisement.title,
          description: this.advertisement.description,
          condition: this.advertisement.condition,
          price: this.advertisement.price,
          expirationDate: this.advertisement.expirationDate,
          carId: this.advertisement.carId
        });

        if (data.carID) {
          await this.loadCarDetails(data.carID);
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

      if (carData && 'location' in carData) {
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
          cityID: (carData as any).location?.cityID || defaultCar.cityID,
          model: {
            id: carData.model?.id ?? defaultCar.model.id,
            name: carData.model?.name ?? defaultCar.model.name,
            manufacturer: {
              id: carData.model?.manufacturer?.id ?? 0,
              name: carData.model?.manufacturer?.name ?? ''
            }
          }
        };

        this.advertisement.carName = this.currentCar.name;

        if (this.currentCar.model.manufacturer?.id) {
          this.selectedManufacturerId = this.currentCar.model.manufacturer.id;
          await this.loadModels(this.selectedManufacturerId);
        }

        // Update form with car details
        if (this.advertisementId !== 0) {
          this.newCarForm.patchValue({
            name: this.currentCar.name,
            manufacturerId: this.currentCar.model.manufacturer?.id,
            modelId: this.currentCar.model.id,
            year: this.currentCar.year,
            engineCapacity: this.currentCar.engineCapacity,
            fuelType: this.currentCar.fuelType,
            transmission: this.currentCar.transmission,
            doors: this.currentCar.doors,
            fuelConsumption: this.currentCar.fuelConsumption,
            mileage: this.currentCar.mileage,
            color: this.currentCar.color,
            hasServiceHistory: this.currentCar.hasServiceHistory,
            bodyId: this.currentCar.bodyID,
            cityId: this.currentCar.cityID
          });
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

        this.availableCars = this.cars = carsData
          .map((car: CarGetAllResponse): CarWithAdvertisement => ({
            ...car,
            isInUse: usedCarIds.has(car.id)
          }))
          .filter((car: CarWithAdvertisement): boolean =>
            !car.isInUse || (this.advertisement?.carName === car.name));

        this.groupCarsByManufacturer();

        if (this.advertisementId && this.advertisement.carId) {
          this.onCarSelected(this.advertisement.carId);
        }
      } else {
        this.availableCars = this.cars = [];
      }
    } catch (error) {
      this.handleError('Error loading cars', error);
      this.availableCars = this.cars = [];
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

  async updateAdvertisement(): Promise<void> {
    if (this.advertisementForm.invalid ||
      (!this.carModeControl.value && this.advertisementForm.get('carId')?.value === 0) ||
      (this.carModeControl.value && this.newCarForm.invalid)) {

      this.markFormGroupTouched(this.advertisementForm);
      if (this.carModeControl.value) {
        this.markFormGroupTouched(this.newCarForm);
      }

      // Show error message if no car is selected
      if (!this.carModeControl.value && this.advertisementForm.get('carId')?.value === 0) {
        this.snackBar.open('Please select a car', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }

      return;
    }

    try {
      this.loading.saving = true;
      this.errorMessage = '';

      let carId = this.advertisementForm.get('carId')?.value;

      // Handle car creation/update
      if (this.carModeControl.value) {
        const carData = this.newCarForm.value;
        const carRequest: CarUpdateOrInsertRequest = {
          id: this.currentCar?.id,
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
          bodyID: carData.bodyId,
          cityID: carData.cityId,
          modelID: carData.modelId
        };

        const carResponse = await this.carUpdateService.handleAsync(carRequest).toPromise();
        if (carResponse?.id) {
          carId = carResponse.id;
        } else {
          throw new Error('Failed to save car details');
        }
      }

      // Set the primary image before saving the advertisement
      const primaryImageId = this.advertisement.images.find(img => img.isPrimary)?.id;
      if (primaryImageId) {
        await this.setPrimaryImage(primaryImageId).toPromise(); // Ensure the primary image is set
      }

      const formData = this.advertisementForm.value;
      const advertRequest: AdvertUpdateOrInsertRequest = {
        ID: this.advertisementId || undefined,
        Title: formData.title.trim(),
        Description: formData.description?.trim() ?? '',
        Condition: Number(VehicleCondition[formData.condition as keyof typeof VehicleCondition]),
        Price: formData.price,
        CarID: carId,
        ExpirationDate: formData.expirationDate
      };

      const tempSelectedFiles = [...this.selectedFiles];

      const response = await this.advertisementUpdateService.handleAsync(advertRequest).toPromise();

      if (response && !this.advertisementId) {
        this.advertisementId = response.id;
        this.advertisement.id = response.id;

        if (tempSelectedFiles.length > 0) {
          this.selectedFiles = tempSelectedFiles;
          await this.uploadImages();
        }
      } else if (this.advertisementId) {
        await this.uploadImages();
      }

      this.snackBar.open(
        `Advertisement ${this.advertisementId ? 'updated' : 'created'} successfully`,
        'Close',
        { duration: 3000 }
      );

      this.router.navigate(['/admin/advertisements']);
    } catch (error) {
      this.handleError('Error saving advertisement', error);
    } finally {
      this.loading.saving = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  async onManufacturerChange(manufacturerId: number): Promise<void> {
    this.newCarForm.patchValue({ modelId: 0 });
    if (manufacturerId) {
      await this.loadModels(manufacturerId);
    } else {
      this.models = [];
    }
  }

  deleteImage(imageId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Are you sure you want to delete this image?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading.saving = true;

        // Find if we're deleting a primary image before deletion
        const deletedImage = this.advertisement.images.find(img => img.id === imageId);
        const wasPrimary = deletedImage?.isPrimary;
        const remainingImages = this.advertisement.images.filter(img => img.id !== imageId);

        this.carImageDeleteService.handleAsync(imageId)
          .pipe(finalize(() => this.loading.saving = false))
          .subscribe({
            next: () => {
              // Update local state
              this.advertisement.images = remainingImages;

              // If we deleted the primary image and there are remaining images
              if (wasPrimary && remainingImages.length > 0) {
                // Set the first remaining image as primary
                this.setPrimaryImage(remainingImages[0].id).subscribe({
                  next: () => {
                    this.snackBar.open('Image deleted and new primary image set', 'Close', { duration: 3000 });
                  },
                  error: (error) => this.handleError('Error setting new primary image', error)
                });
              } else {
                this.snackBar.open('Image deleted successfully', 'Close', { duration: 3000 });
              }
            },
            error: (error) => this.handleError('Error deleting image', error)
          });
      }
    });
  }

  // Helper method to handle setting primary image
  setPrimaryImage(imageId: number): Observable<any> {
    const request: SetPrimaryRequest = { imageId: imageId };

    // Update local state immediately
    this.advertisement.images = this.advertisement.images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));

    return this.carImageSetPrimaryService.handleAsync(request).pipe(
      tap(response => {
        console.log('API response for setting primary image:', response);
      }),
      catchError(error => {
        this.handleError('Error setting primary image', error);
        return of(null);
      })
    );
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
    this.errorMessage = `${message}: ${errorMessage}`;
    this.snackBar.open(this.errorMessage, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      verticalPosition: 'bottom'
    });
  }

  private getConditionString(condition: string | number): string {
    const conditionNumber = Number(condition);
    if (isNaN(conditionNumber) || !VehicleCondition[conditionNumber]) {
      return VehicleCondition[VehicleCondition.Used];
    }
    return VehicleCondition[conditionNumber];
  }

  getFuelTypeName(fuelType: FuelType | undefined): string {
    if (fuelType === undefined) return '';
    return FuelType[fuelType] || 'Unknown';
  }

  getTransmissionTypeName(transmissionType: TransmissionType | undefined): string {
    if (transmissionType === undefined) return '';
    return TransmissionType[transmissionType] || 'Unknown';
  }

  previewImages(): void {
    const existingImages = this.advertisement.images.filter(img => !(img as any).isNew) || [];
    const newImages = this.selectedFiles.map((file, index) => ({
      url: URL.createObjectURL(file),
      isPrimary: !existingImages.some(img => img.isPrimary) && index === 0,
      id: -Math.random(), // Temporary negative ID
      isNew: true
    }));

    this.advertisement.images = [...existingImages, ...newImages];
  }

  updateImageUrls(uploadedFileUrls: string[]): void {
    // Update the URLs of images after load
    this.advertisement.images = this.advertisement.images.map((image, index) => ({
      ...image,
      url: `${uploadedFileUrls[index]}` // Correct URL format
    }));
  }

  // Helper function to format image URLs correctly
  formatImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http://localhost:7000')) {
      return imageUrl;
    }
    return `${MyConfig.api_address}${imageUrl}`;
  }

  private extractErrorMessage(error: any): string {
    if (error?.error) {
      // Try to extract the actual error message from the stack trace
      const match = error.error.match(/System\.Exception: (.*?)\r\n/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return error?.message || 'An unknown error occurred';
  }

  async uploadImages(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    const errors: string[] = [];
    const uploadPromises = this.selectedFiles.map(async (file, index) => {
      const formData = new FormData();
      formData.append('Image', file);
      formData.append('AdvertisementID', this.advertisement.id.toString());
      formData.append('IsPrimary', (index === 0 && !this.advertisement.images.some(img => img.isPrimary)).toString());

      try {
        const response = await this.carImageUploadService.handleAsync(formData).toPromise();
        if (response) {
          return {
            id: response.id,
            url: `${MyConfig.api_address}${response.imageUrl}`,
            isPrimary: response.isPrimary
          };
        }
        return null;
      } catch (error: any) {
        const errorMessage = this.extractErrorMessage(error);
        errors.push(`Error uploading ${file.name}: ${errorMessage}`);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r): r is AdvertImageResponse => r !== null);

      // Show errors first if any
      if (errors.length > 0) {
        // Show each error message with a delay
        errors.forEach((error, index) => {
          setTimeout(() => {
            this.snackBar.open(error, 'Close', {
              duration: 5000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'bottom'
            });
          }, index * 300); // 300ms delay between each error
        });
      }

      this.advertisement.images = [
        ...this.advertisement.images.filter(img => !(img as any).isNew),
        ...successfulUploads
      ];

      // Clear selected files
      this.selectedFiles = [];

      // Show success message after errors (if any) with a delay
      if (successfulUploads.length > 0) {
        setTimeout(() => {
          this.snackBar.open('Images uploaded successfully', 'Close', {
            duration: 3000,
            verticalPosition: 'bottom'
          });
        }, errors.length * 300); // Wait for all error messages
      }
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'bottom'
      });
    }
  }

  private groupCarsByManufacturer(): void {
    this.groupedCars = this.availableCars.reduce((groups: GroupedCars, car) => {
      const manufacturer = car.manufacturerName || 'Other';
      if (!groups[manufacturer]) {
        groups[manufacturer] = [];
      }
      groups[manufacturer].push(car);
      return groups;
    }, {});

    // Sort manufacturers and cars within each group
    Object.keys(this.groupedCars).forEach(manufacturer => {
      this.groupedCars[manufacturer].sort((a, b) =>
        a.name.localeCompare(b.name) || b.year - a.year
      );
    });
  }

  onCarSelected(carId: number): void {
    this.selectedCar = this.availableCars.find(car => car.id === carId) || null;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      // Convert FileList to Array and filter for images
      const imageFiles = Array.from(files).filter((file): file is File => {
        return file instanceof File && file.type.startsWith('image/');
      });
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => this.handleImageUpload(file));
      }
    }
  }

  handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImages.push(e.target.result);
      this.imageFiles.push(file);

      // Add to selectedFiles array for upload
      this.selectedFiles.push(file);
      this.previewImages();
    };
    reader.readAsDataURL(file);
  }

  // Update onImageSelected to handle multiple files
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      Array.from(files)
        .filter((file): file is File => file instanceof File && file.type.startsWith('image/'))
        .forEach(file => this.handleImageUpload(file));
    }
  }
}
