import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyAuthService } from '../../../services/auth-services/my-auth.service';
import { AdvertisementUpdateOrInsertEndpointService } from '../../../endpoints/advertisement-endpoints/advertisement-update-or-insert-endpoint.service';
import { CarUpdateOrInsertEndpointService } from '../../../endpoints/car-endpoints/car-update-or-insert-endpoint.service';
import { ManufacturerGetAllEndpointService } from '../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import { CarModelGetByManufacturerEndpointService } from '../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import { CityGetAll1EndpointService } from '../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import { BodyTypeGetAllEndpointService } from '../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import { VehicleCondition, FuelType, TransmissionType } from '../../../services/car-services/car-enums';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  AdvertisementGetByIdEndpointService
} from '../../../endpoints/advertisement-endpoints/advertisement-get-by-id-endpoint.service';
import {CarGetByIdEndpointService} from '../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';
import {
  CarImageSetPrimaryEndpointService
} from '../../../endpoints/car-image-endpoints/car-image-set-primary-endpoint.service';
import {CarImageDeleteEndpointService} from '../../../endpoints/car-image-endpoints/car-image-delete-endpoint.service';
import {
  AdvertisementImagesGetByIdEndpointService
} from '../../../endpoints/car-image-endpoints/car-image-get-by-advert-endpoint.service';
import {
  CarImageBulkUploadEndpointService
} from '../../../endpoints/car-image-endpoints/car-image-bulk-upload-endpoint.service';

interface AdvertisementImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

@Component({
  selector: 'app-advertisement-create-edit',
  templateUrl: './advertisement-create-edit.component.html',
  styleUrls: ['./advertisement-create-edit.component.scss']
})

export class AdvertisementCreateEditComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  advertisementForm!: FormGroup;
  carForm!: FormGroup;
  imageForm!: FormGroup;
  isEdit = false;
  advertisementId: number | null = null;
  loading = false;
  uploadingImages = false;
  isDragging = false;

  // Lookup data
  manufacturers: any[] = [];
  models: any[] = [];
  cities: any[] = [];
  bodyTypes: any[] = [];
  selectedFiles: File[] = [];

  readonly currentYear = new Date().getFullYear();
  readonly vehicleConditions = Object.values(VehicleCondition).filter(value => typeof value === 'number');
  readonly fuelTypes = Object.values(FuelType).filter(value => typeof value === 'number');
  readonly transmissionTypes = Object.values(TransmissionType).filter(value => typeof value === 'number');

  readonly maxFileSizeMB = 10;
  readonly allowedExtensions = ['.jpg', '.jpeg', '.png'];
  readonly maxWidth = 1920;
  readonly maxHeight = 1080;

  advertisementImages: AdvertisementImage[] = [];
  selectedFilesPrimary: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: MyAuthService,
    private advertisementGetByIdService: AdvertisementGetByIdEndpointService,
    private advertisementUpdateService: AdvertisementUpdateOrInsertEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    private carGetByIdService: CarGetByIdEndpointService,
    private carImageSetPrimaryService: CarImageSetPrimaryEndpointService,
    private carImageDeleteService: CarImageDeleteEndpointService,
    private carImageBulkUploadService: CarImageBulkUploadEndpointService,
    private cityService: CityGetAll1EndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private advertisementImagesGetByIdService: AdvertisementImagesGetByIdEndpointService,
  ) {
    this.initializeForms();
  }

  private initializeForms() {
    this.advertisementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      condition: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0), Validators.max(1000000)]]
    });

    this.carForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      manufacturerId: [null, Validators.required],
      modelId: [{value: null, disabled: true}, Validators.required],
      year: [this.currentYear, [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear + 1)
      ]],
      engineCapacity: [null, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(10)
      ]],
      fuelType: [null, Validators.required],
      transmission: [null, Validators.required],
      doors: [4, [
        Validators.required,
        Validators.min(2),
        Validators.max(8)
      ]],
      fuelConsumption: [null, [
        Validators.required,
        Validators.min(0),
        Validators.max(30)
      ]],
      mileage: [0, [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      hasServiceHistory: [false],
      bodyId: [null, Validators.required],
      cityId: [null, Validators.required]
    });

    this.imageForm = this.fb.group({
      images: [null, Validators.required]
    });

    this.carForm.get('manufacturerId')?.valueChanges.subscribe(value => {
      const modelControl = this.carForm.get('modelId');
      if (value) {
        modelControl?.enable();
        this.onManufacturerChange(value);
      } else {
        modelControl?.disable();
        modelControl?.setValue(null);
        this.models = [];
      }
      // Reset model value when manufacturer changes
      if (modelControl?.value) {
        modelControl.setValue(null);
      }
    });
  }

  ngOnInit() {
    const currentUser = this.authService.getMyAuthInfo();
    if (!currentUser?.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadLookupData();

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.advertisementId = +params['id'];
        this.isEdit = true;
        this.loadAdvertisement();
      }
    });
  }

  private loadLookupData() {
    this.loading = true;
    forkJoin({
      manufacturers: this.manufacturerService.handleAsync(),
      cities: this.cityService.handleAsync(),
      bodyTypes: this.bodyTypeService.handleAsync()
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.manufacturers = data.manufacturers || [];
        this.cities = data.cities || [];
        this.bodyTypes = data.bodyTypes || [];
      },
      error: (error) => {
        this.snackBar.open('Error loading form data', 'Close', { duration: 3000 });
      }
    });
  }

  async onManufacturerChange(manufacturerId: number) {
    if (!manufacturerId) {
      this.models = [];
      this.carForm.get('modelId')?.setValue(null);
      return;
    }

    try {
      this.loading = true;
      this.models = await this.modelService.handleAsync(manufacturerId).toPromise() || [];
    } catch (error) {
      this.snackBar.open('Error loading models', 'Close', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  private validateImage(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        this.snackBar.open(`File size must be less than ${this.maxFileSizeMB}MB`, 'Close', { duration: 3000 });
        resolve(false);
        return;
      }

      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.allowedExtensions.includes(extension)) {
        this.snackBar.open(`Only ${this.allowedExtensions.join(', ')} files are allowed`, 'Close', { duration: 3000 });
        resolve(false);
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (img.width > this.maxWidth || img.height > this.maxHeight) {
          this.snackBar.open(`Image dimensions must not exceed ${this.maxWidth}x${this.maxHeight}`, 'Close', { duration: 3000 });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        this.snackBar.open('Invalid image file', 'Close', { duration: 3000 });
        resolve(false);
      };
    });
  }

  private async handleFiles(files: File[]) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const totalImages = this.selectedFiles.length + imageFiles.length;

    if (totalImages > 10) {
      this.snackBar.open('Maximum 10 images allowed', 'Close', { duration: 3000 });
      return;
    }

    for (const file of imageFiles) {
      const isValid = await this.validateImage(file);
      if (isValid) {
        this.selectedFiles.push(file);
      }
    }
  }

  async loadAdvertisementImages() {
    if (!this.advertisementId) return;

    try {
      const images = await this.advertisementImagesGetByIdService
        .handleAsync(this.advertisementId)
        .toPromise();

      if (images && Array.isArray(images)) {
        this.advertisementImages = images.map(img => ({
          id: img.id,
          url: img.imageUrl,
          isPrimary: img.isPrimary
        }));
        console.log('Loaded images:', this.advertisementImages); // Debug log
      }
    } catch (error) {
      console.error('Error loading images:', error); // Debug log
      this.snackBar.open('Error loading images', 'Close', { duration: 3000 });
    }
  }

  async setPrimaryImage(imageId: number) {
    try {
      await this.carImageSetPrimaryService.handleAsync({ imageId }).toPromise();
      await this.loadAdvertisementImages();

      // Update local state immediately for better UX
      this.advertisementImages = this.advertisementImages.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      }));

      this.snackBar.open('Primary image updated', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error setting primary image:', error); // Debug log
      this.snackBar.open('Error setting primary image', 'Close', { duration: 3000 });
    }
  }

  async deleteImage(imageId: number) {
    try {
      await this.carImageDeleteService.handleAsync(imageId).toPromise();

      // Update local state immediately for better UX
      this.advertisementImages = this.advertisementImages.filter(img => img.id !== imageId);

      this.snackBar.open('Image deleted', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error deleting image:', error); // Debug log
      this.snackBar.open('Error deleting image', 'Close', { duration: 3000 });
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  async onSubmit() {
    if (this.advertisementForm.invalid || this.carForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    try {
      this.loading = true;

      // 1. Create/Update Car
      const carData = this.carForm.value;
      const carResponse = await this.carUpdateService.handleAsync(carData).toPromise();

      if (!carResponse) {
        throw new Error('Failed to save car details');
      }

      // 2. Create/Update Advertisement
      const advertisementData = {
        ...this.advertisementForm.value,
        id: this.advertisementId,
        carID: carResponse.id,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const adResponse = await this.advertisementUpdateService.handleAsync(advertisementData).toPromise();

      if (!adResponse) {
        throw new Error('Failed to save advertisement');
      }

      // 3. Upload Images (if any)
      if (this.selectedFiles.length > 0) {
        this.advertisementId = adResponse.id;
        await this.uploadImages();
      }

      this.snackBar.open(
        `Advertisement ${this.isEdit ? 'updated' : 'created'} successfully`,
        'Close',
        { duration: 3000 }
      );
      this.router.navigate(['/public/advertisements', adResponse.id]);

    } catch (error: any) {
      this.snackBar.open(
        error.error?.message || 'Error saving advertisement',
        'Close',
        { duration: 3000 }
      );
    } finally {
      this.loading = false;
    }
  }

  setSelectedFilePrimary(index: number) {
    this.selectedFilesPrimary = index;
  }

  private async uploadImages(): Promise<void> {
    if (!this.selectedFiles.length || !this.advertisementId) return;

    try {
      this.uploadingImages = true;
      const formData = new FormData();
      formData.append('AdvertisementID', this.advertisementId.toString());

      this.selectedFiles.forEach((file, index) => {
        formData.append('Images', file);
      });

      const response = await this.carImageBulkUploadService.handleAsync(formData).toPromise();

      if (response?.uploadedImages?.length) {
        if (this.selectedFilesPrimary !== null && response.uploadedImages[this.selectedFilesPrimary]) {
          await this.setPrimaryImage(response.uploadedImages[this.selectedFilesPrimary].id);
        }

        await this.loadAdvertisementImages();
        this.selectedFiles = [];
        this.selectedFilesPrimary = null;
        this.snackBar.open('Images uploaded successfully', 'Close', { duration: 3000 });
      }
    } catch (error: any) {
      this.snackBar.open(
        error.error?.message || 'Error uploading images',
        'Close',
        { duration: 3000 }
      );
    } finally {
      this.uploadingImages = false;
    }
  }

  private async loadAdvertisement() {
    if (!this.advertisementId) return;

    try {
      this.loading = true;
      const advertisement = await this.advertisementGetByIdService
        .handleAsync(this.advertisementId)
        .toPromise();

      if (!advertisement) {
        throw new Error('Advertisement not found');
      }

      // Check if user owns this advertisement
      const currentUser = this.authService.getMyAuthInfo();
      if (advertisement.userID !== currentUser?.userId) {
        this.router.navigate(['/unauthorized']);
        return;
      }

      // Populate forms
      this.advertisementForm.patchValue({
        title: advertisement.title,
        description: advertisement.description,
        condition: advertisement.condition,
        price: advertisement.price
      });

      // Load car details and patch form
      const car = await this.carGetByIdService.handleAsync(advertisement.carID).toPromise();
      if (car) {
        await this.onManufacturerChange(car.model.manufacturer.id);
        this.carForm.patchValue({
          name: car.name,
          manufacturerId: car.model.manufacturer.id,
          modelId: car.model.id,
          year: car.year,
          engineCapacity: car.engineCapacity,
          fuelType: car.fuelType,
          transmission: car.transmission,
          doors: car.doors,
          fuelConsumption: car.fuelConsumption,
          mileage: car.mileage,
          color: car.color,
          hasServiceHistory: car.hasServiceHistory,
          bodyId: car.bodyType.id,
          cityId: car.location.cityID
        });
      }

      await this.loadAdvertisementImages();
    } catch (error) {
      console.error('Error loading advertisement:', error); // Debug log
      this.snackBar.open('Error loading advertisement', 'Close', { duration: 3000 });
      this.router.navigate(['/advertisements']);
    } finally {
      this.loading = false;
    }
  }

  // Helper methods for template
  getConditionName(condition: number): string {
    return VehicleCondition[condition] || '';
  }

  getFuelTypeName(type: number): string {
    return FuelType[type] || '';
  }

  getTransmissionName(type: number): string {
    return TransmissionType[type] || '';
  }

  get cancelRoute(): string {
    return this.isEdit ? `/public/advertisements/${this.advertisementId}` : '/public';
  }

  onCancel() {
    this.router.navigate([this.cancelRoute]);
  }
}
