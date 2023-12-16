import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ToolFunctionService } from '../tool-function.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private toolFunctionService: ToolFunctionService) {
    this.form = this.fb.group({
      name: '',
      description: '',
      properties: this.fb.array([]),
      required: this.fb.array([])  // Inisialisasi sebagai FormArray
    });
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  addProperty(): void {
    const propertyGroup = this.fb.group({
      key: '',
      type: 'string',
      description: ''
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
      const indexToRemove = requiredArray.controls.findIndex(control => control.value === key);
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

  submit(): void {
    const formValue = this.form.value;
    
    // Membuat objek 'properties' dari array 'properties'
    const propertiesObj = formValue.properties.reduce((obj: {[key: string]: any}, prop: any) => {
      obj[prop.key] = { type: prop.type, description: prop.description };
      return obj;
    }, {});
  
    // Membuat objek hasil yang akan dikirim
    const result = {
      name: formValue.name,
      description: formValue.description,
      properties: propertiesObj,
      required: formValue.required
    };
  
    console.log(result);
    this.toolFunctionService.createToolFunction(result).subscribe(
      (resp: any) => {
        if(resp.status === 200){
          console.log(resp);
          // Reset form di sini
          this.form.reset();
          // Tambahan: Reset array properties dan required
          while (this.properties.length !== 0) {
            this.properties.removeAt(0);
          }
          while (this.form.value.required.length !== 0) {
            this.form.value.required.pop();
          }
        } else {
          console.log(resp);
        }
      }, error => {
        console.log("Error");
      }
    );
  }
}
