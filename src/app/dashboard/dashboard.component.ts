import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ToolFunctionService } from '../tool-function.service';
import { LoadingService } from '../loading.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface FunctionInfo {
  id: number;
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
  propertyKeys?: string[]; // Menambahkan properti tambahan untuk menyimpan kunci
}

interface Data {
  function: FunctionInfo;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  listData: Data[] = [];
  updateData: Data = {
    function: {
      id: 0, // atau sebuah nilai default yang sesuai
      name: '',
      description: '',
      parameters: {
        type: '',
        properties: {},
        required: [],
      },
      propertyKeys: [],
    },
  };

  @ViewChild('updateModal') updateModal: ElementRef | undefined;
  @ViewChild('createModal') createModal: ElementRef | undefined;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toolFunctionService: ToolFunctionService,
    private loadingService: LoadingService,
    private modalService: NgbModal
  ) {
    this.form = this.fb.group({
      id: [''],
      name: [''],
      description: [''],
      properties: this.fb.array([]),
      required: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.toolFunctionService.getToolFunctions().subscribe({
      next: (resp: any) => {
        this.listData = resp.data.map((item: Data) => {
          const propertyKeys = Object.keys(item.function.parameters.properties);
          return {
            ...item,
            function: { ...item.function, propertyKeys },
          };
        });

        console.log('Data with Property Keys:', this.listData);
      },
    });
  }

  deleteItem(index: number, id: number): void {
    // Hapus item dari array
    this.listData.splice(index, 1);

    this.toolFunctionService.deleteToolFunction(id).subscribe({
      next: (resp: any) => {
        console.log(resp.message);
      },
    });
  }

  get properties(): FormArray {
    return this.form.get('properties') as FormArray;
  }

  addProperty(): void {
    const propertyGroup = this.fb.group({
      key: [''],
      type: ['string'],
      description: [''],
    });
    this.properties.push(propertyGroup);
  }

  removeProperty(index: number): void {
    this.properties.removeAt(index);
  }

  saveUpdate(): void {
    if (this.form.valid) {
      // Start loading
      this.loadingService.show();
      const formValue = this.form.value;

      // Create the payload in the format expected by your API...
      const payload = {
        // ... your code to prepare the payload
      };
    }
  }

  openUpdate(id: number) {
    this.toolFunctionService.getToolFunction(id).subscribe({
      next: (response: any) => {
        if (response.data && response.data.function) {
          // Ekstrak property keys dari object properties
          const propertyKeys = Object.keys(
            response.data.function.parameters.properties
          );

          // Menambahkan propertyKeys ke function data tanpa memodifikasi interface
          this.updateData.function = { ...response.data.function }; // Salin data yang ada
          this.updateData.function.propertyKeys = propertyKeys; // Tambahkan propertyKeys

          console.log('Data for Update:', this.updateData);
          this.setupForm(this.updateData.function); // Persiapkan form dengan data untuk update
          this.modalService.open(this.updateModal); // Buka modal setelah data di-load
        } else {
          console.error('Unexpected response structure:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching data for update:', error);
      },
    });
  }

  private setupForm(functionInfo: FunctionInfo): void {
    // Pastikan propertyKeys ada
    const propertyKeys =
      functionInfo.propertyKeys ||
      Object.keys(functionInfo.parameters.properties);

    const propertiesFormGroups = propertyKeys.map((key) => {
      const property = functionInfo.parameters.properties[key];
      return this.fb.group({
        key: key,
        type: property.type,
        description: property.description,
      });
    });

    this.form = this.fb.group({
      id: functionInfo.id,
      name: functionInfo.name,
      description: functionInfo.description,
      properties: this.fb.array(propertiesFormGroups),
      required: this.fb.array(functionInfo.parameters.required),
    });
  }

  isRequired(key: string): boolean {
    return this.form.value.required.includes(key);
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

  openCreateModal() {
    // Inisialisasi form dengan nilai kosong
    this.setupForm({
      id: 0, // Untuk entri baru, ID bisa diabaikan atau diset 0
      name: '',
      description: '',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
      propertyKeys: [],
    });

    // Buka modal create
    this.modalService.open(this.createModal);
  }

  createFunction(): void {
    if (this.form.valid) {
      this.loadingService.show(); // Tampilkan indikator loading

      const formValue = this.form.value;
      // Membuat objek 'properties' dari array 'properties'
      const propertiesObj: { [key: string]: any } = {};
      formValue.properties.forEach((prop: any) => {
        propertiesObj[prop.key] = {
          type: prop.type,
          description: prop.description,
        };
      });

      // Membuat payload dalam format yang diinginkan oleh backend API Anda
      const payload = {
        name: formValue.name,
        description: formValue.description,
        properties: propertiesObj,
        required: formValue.required,
      };

      // Kirim payload ke server menggunakan service untuk membuat entri baru
      this.toolFunctionService.createToolFunction(payload).subscribe({
        next: (response) => {
          this.loadingService.hide(); // Sembunyikan indikator loading
          // Handle successful creation, seperti refresh list data
          this.modalService.dismissAll(); // Tutup modal
          // ... tambahan kode untuk memperbarui UI atau memberikan umpan balik ke pengguna ...
          this.toolFunctionService.getToolFunctions().subscribe({
            next: (resp: any) => {
              this.listData = resp.data.map((item: Data) => {
                const propertyKeys = Object.keys(
                  item.function.parameters.properties
                );
                return {
                  ...item,
                  function: { ...item.function, propertyKeys },
                };
              });

              console.log('Data with Property Keys:', this.listData);
            },
          });
        },
        error: (error) => {
          this.loadingService.hide(); // Sembunyikan indikator loading
          // Handle error, seperti menampilkan pesan kesalahan
          console.error('Error creating new function:', error);
        },
      });
    }
  }
}
