import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import {
  ManufacturerGetAllEndpointService,
  ManufacturerGetAllResponse
} from '../../../../../endpoints/manufacturer-endpoints/manufacturer-get-all-endpoint.service';
import {
  CarModelGetByManufacturerEndpointService,
  CarModelGetByManufacturerResponse
} from '../../../../../endpoints/car-model-endpoints/car-model-get-by-manufacturer-endpoint.service';
import {
  CityGetAll1EndpointService,
  CityGetAll1Response
} from '../../../../../endpoints/city-endpoints/city-get-all1-endpoint.service';
import {
  BodyTypeGetAllEndpointService,
  BodyTypeGetAllResponse
} from '../../../../../endpoints/body-type-endpoints/body-type-get-all-endpoint.service';
import {FuelType, TransmissionType} from '../../../../../services/car-services/car-enums';
import {
  CarUpdateOrInsertEndpointService, CarUpdateOrInsertRequest
} from '../../../../../endpoints/car-endpoints/car-update-or-insert-endpoint.service';
import {CarGetByIdResponse} from '../../../../../endpoints/car-endpoints/car-get-by-id-endpoint.service';

@Component({
  selector: 'app-car-edit-dialog',
  templateUrl: './car-edit-dialog.component.html',
  styleUrls: ['./car-edit-dialog.component.scss']
})
export class CarEditDialogComponent {
  carForm!: FormGroup;
  loading = false;
  manufacturers: ManufacturerGetAllResponse[] = [];
  models: CarModelGetByManufacturerResponse[] = [];
  cities: CityGetAll1Response[] = [];
  bodyTypes: BodyTypeGetAllResponse[] = [];

  readonly currentYear = new Date().getFullYear();
  readonly fuelTypes = Object.values(FuelType).filter(value => typeof value === 'number') as FuelType[];
  readonly transmissionTypes = Object.values(TransmissionType).filter(value => typeof value === 'number') as TransmissionType[];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CarEditDialogComponent>,
    private snackBar: MatSnackBar,
    private manufacturerService: ManufacturerGetAllEndpointService,
    private modelService: CarModelGetByManufacturerEndpointService,
    private cityService: CityGetAll1EndpointService,
    private bodyTypeService: BodyTypeGetAllEndpointService,
    private carUpdateService: CarUpdateOrInsertEndpointService,
    @Inject(MAT_DIALOG_DATA) public data: { car: CarGetByIdResponse }
  ) {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    const car = this.data.car;
    console.log('Complete car data:', car);

    this.carForm = this.fb.group({
      name: [car.name, [Validators.required, Validators.minLength(2)]],
      manufacturerId: [car.model?.manufacturer?.id, Validators.required],
      modelId: [car.model?.id, Validators.required],
      year: [car.year, [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear + 1)
      ]],
      engineCapacity: [car.engineCapacity, [
        Validators.required,
        Validators.min(0.1),
        Validators.max(10)
      ]],
      fuelType: [car.fuelType, Validators.required],
      transmission: [car.transmission, Validators.required],
      doors: [car.doors, [
        Validators.required,
        Validators.min(2),
        Validators.max(8)
      ]],
      fuelConsumption: [car.fuelConsumption, [
        Validators.required,
        Validators.min(0),
        Validators.max(30)
      ]],
      mileage: [car.mileage, [Validators.required, Validators.min(0)]],
      color: [car.color, Validators.required],
      hasServiceHistory: [car.hasServiceHistory],
      bodyId: [car.bodyType.id, Validators.required],
      cityId: [car.location.cityID, Validators.required]
    });

    console.log('Initial car data:', {
      cityId: car.location.cityID,
      formValue: this.carForm.value
    });
  }

  private async loadData(): Promise<void> {
    try {
      this.loading = true;
      const [manufacturers, cities, bodyTypes] = await Promise.all([
        this.manufacturerService.handleAsync().toPromise(),
        this.cityService.handleAsync().toPromise(),
        this.bodyTypeService.handleAsync().toPromise()
      ]);

      this.manufacturers = manufacturers || [];
      this.cities = cities || [];
      this.bodyTypes = bodyTypes || [];

      // Log loaded data to debug
      console.log('Loaded data:', {
        cities: this.cities,
        currentCityId: this.carForm.get('cityId')?.value
      });

      if (this.data.car.model?.manufacturer?.id) {
        await this.loadModels(this.data.car.model.manufacturer.id);
      }

      // Ensure form values are set after data is loaded
      this.carForm.patchValue({
        cityId: this.data.car.location.cityID,
        bodyId: this.data.car.bodyType.id
      });
    } catch (error) {
      this.handleError('Error loading data', error);
    } finally {
      this.loading = false;
    }
  }

  async onManufacturerChange(manufacturerId: number): Promise<void> {
    this.carForm.patchValue({ modelId: null });
    if (manufacturerId) {
      await this.loadModels(manufacturerId);
    } else {
      this.models = [];
    }
  }

  private async loadModels(manufacturerId: number): Promise<void> {
    try {
      const models = await this.modelService.handleAsync(manufacturerId).toPromise();
      this.models = models || [];
    } catch (error) {
      this.handleError('Error loading models', error);
    }
  }

  async save(): Promise<void> {
    if (this.carForm.invalid) {
      this.markFormGroupTouched(this.carForm);
      return;
    }

    try {
      this.loading = true;
      const formData = this.carForm.value;

      const request: CarUpdateOrInsertRequest = {
        id: this.data.car.id,
        name: formData.name,
        year: formData.year,
        engineCapacity: formData.engineCapacity,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        doors: formData.doors,
        fuelConsumption: formData.fuelConsumption,
        mileage: formData.mileage,
        color: formData.color,
        hasServiceHistory: formData.hasServiceHistory,
        bodyID: formData.bodyId,
        cityID: formData.cityId,
        modelID: formData.modelId
      };

      const response = await this.carUpdateService
        .handleAsync(request)
        .pipe(finalize(() => this.loading = false))
        .toPromise();

      if (response) {
        this.snackBar.open('Car details updated successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(response);
      }
    } catch (error) {
      this.handleError('Error updating car details', error);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
    this.snackBar.open(`${message}: ${errorMessage}`, 'Close', { duration: 5000 });
  }

  getFuelTypeName(fuelType: FuelType | undefined): string {
    if (fuelType === undefined) return '';
    return FuelType[fuelType] || 'Unknown';
  }

  getTransmissionTypeName(transmissionType: TransmissionType | undefined): string {
    if (transmissionType === undefined) return '';
    return TransmissionType[transmissionType] || 'Unknown';
  }
}
