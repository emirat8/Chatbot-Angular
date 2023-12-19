import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ToolFunctionService } from '../tool-function.service';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-create-function',
  templateUrl: './create-function.component.html',
  styleUrls: ['./create-function.component.css'],
})
export class CreateFunctionComponent {
  selectedFile: File | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toolFunctionService: ToolFunctionService,
    private loadingService: LoadingService
  ) {
    this.form = this.fb.group({
      name: '',
      description: '',
      properties: this.fb.array([]),
      required: this.fb.array([]), // Inisialisasi sebagai FormArray
    });
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  addProperty(): void {
    const propertyGroup = this.fb.group({
      key: '',
      type: 'string',
      description: '',
    });

    this.properties.push(propertyGroup);
  }

  removeProperty(index: number): void {
    const key = this.properties.at(index).value.key;
    this.properties.removeAt(index);
    this.removeFromRequired(key);
  }

  updateRequired(event: any, key: string): void {
    const requiredArray = this.form.get('required') as FormArray;

    if (event.target.checked && !this.isRequired(key)) {
      requiredArray.push(new FormControl(key));
    } else if (!event.target.checked && this.isRequired(key)) {
      const indexToRemove = requiredArray.controls.findIndex(
        (control) => control.value === key
      );
      if (indexToRemove !== -1) {
        requiredArray.removeAt(indexToRemove);
      }
    }
  }

  isRequired(key: string): boolean {
    return this.form.value.required.includes(key);
  }

  removeFromRequired(key: string): void {
    const requiredIndex = this.form.value.required.indexOf(key);
    if (requiredIndex > -1) {
      this.form.value.required.splice(requiredIndex, 1);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    } else {
      this.selectedFile = null;
    }
  }

  submit(): void {
    this.loadingService.show();
    const formValue = this.form.value;

    // Membuat objek 'properties' dari array 'properties'
    const propertiesObj = formValue.properties.reduce(
      (obj: { [key: string]: any }, prop: any) => {
        obj[prop.key] = { type: prop.type, description: prop.description };
        return obj;
      },
      {}
    );

    // Membuat objek hasil yang akan dikirim
    const result = {
      name: formValue.name,
      description: formValue.description,
      properties: propertiesObj,
      required: formValue.required,
    };

    console.log(result);
    this.toolFunctionService.createToolFunction(result).subscribe({
      next: (resp: any) => {
        console.log(resp);

        if (this.selectedFile) {
          this.toolFunctionService
            .postForFile(result.name, this.selectedFile)
            .subscribe({
              next: (resp: any) => {
                console.log(resp.text);
              },
              error: (error: any) => {
                console.error('Error: ', error.text);
              },
            });
        }

        this.selectedFile = null;
        // Reset form di sini
        this.form.reset();
        // Tambahan: Reset array properties dan required
        while (this.properties.length !== 0) {
          this.properties.removeAt(0);
        }
        while (this.form.value.required.length !== 0) {
          this.form.value.required.pop();
        }
      },
      error: (error: any) => {
        error.error.subErrors.forEach((error: any) => {
          console.log(
            `Object: ${error.object}, Field: ${error.field}, Rejected Value: ${error.rejectedValue}, Message: ${error.message}`
          );
        });
      },
      complete: () => {},
    });
    this.loadingService.hide();
  }
}
