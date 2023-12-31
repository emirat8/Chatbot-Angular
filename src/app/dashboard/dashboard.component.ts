import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ToolFunctionService } from '../tool-function.service';
import { LoadingService } from '../loading.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

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
  propertyKeys?: string[];
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
      id: 0,
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
  userId: number = 0;
  token: string | null = '';

  selectedFile: File | null = null;

  systemPrompt: String = '';
  newSystemPrompt: String = '';

  @ViewChild('updateModal') updateModal: ElementRef | undefined;
  @ViewChild('createModal') createModal: ElementRef | undefined;
  @ViewChild('systemPromptModal') systemPromptModal: ElementRef | undefined;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toolFunctionService: ToolFunctionService,
    private loadingService: LoadingService,
    private modalService: NgbModal,
    private route: Router
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
    this.token = localStorage.getItem('token');
    if (this.token) {
      const decodedToken: any = jwtDecode(this.token);
      this.userId = decodedToken.userId;
      console.log('User ID : ', this.userId);

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

      this.toolFunctionService.getSystemPrompt().subscribe({
        next: (resp: any) => {
          this.systemPrompt = resp;
        },
      });
    } else {
      this.route.navigate(['login']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      console.log('File dipilih:', this.selectedFile.name);
    } else {
      this.selectedFile = null;
    }
  }

  deleteItem(index: number, id: number): void {
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

  onHasDocumentChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fungsiIniMemilikiDokumen = input.checked;
    const requiredArray = this.form.get('required') as FormArray;
    if (!this.fungsiIniMemilikiDokumen) {
      this.selectedFile = null;
    }

    if (input.checked) {
      while (this.properties.length !== 0) {
        this.properties.removeAt(0);
      }

      this.addProperty();

      const lastProperty = this.properties.at(this.properties.length - 1);
      lastProperty.get('key')?.setValue('query');
      lastProperty.get('type')?.setValue('string');
      lastProperty.get('key')?.disable();
      lastProperty.get('type')?.disable();

      if (!this.isRequired('query')) {
        requiredArray.push(new FormControl('query'));
      }
    } else {
      this.resetPropertiesAndRequired();
      this.selectedFile = null;
    }
  }

  resetPropertiesAndRequired(): void {
    const properties = this.form.get('properties') as FormArray;
    while (properties.length !== 0) {
      properties.removeAt(0);
    }
    const required = this.form.get('required') as FormArray;
    while (required.length !== 0) {
      required.removeAt(0);
    }
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
    if (this.properties.length > 1) {
      const propertyFormGroup = this.properties.at(index);

      // Cek apakah FormGroup dan FormControl untuk 'key' ada
      if (propertyFormGroup && propertyFormGroup.get('key')) {
        const propertyKey = propertyFormGroup.get('key')!.value;

        // Hapus properti dari properties
        this.properties.removeAt(index);

        // Jika properti tersebut termasuk dalam required, hapus dari array required
        this.removeKeyFromRequired(propertyKey);
      }
    }
  }

  private removeKeyFromRequired(key: string): void {
    const requiredArray = this.form.get('required') as FormArray;
    const index = requiredArray.value.indexOf(key);
    if (index >= 0) {
      requiredArray.removeAt(index);
    }
  }

  saveUpdate(): void {
    if (this.form.valid) {
      this.loadingService.show();
      const formValue = this.form.getRawValue();

      const propertiesObj: { [key: string]: any } = {};
      formValue.properties.forEach((prop: any) => {
        propertiesObj[prop.key] = {
          type: prop.type,
          description: prop.description,
        };
      });

      const payload = {
        name: formValue.name,
        description: formValue.description,
        properties: propertiesObj,
        required: formValue.required,
        document: this.selectedFile != null,
      };

      console.log('PAYLOAD : ', payload);

      this.toolFunctionService
        .updateToolFunction(payload, formValue.id)
        .subscribe({
          next: (response: any) => {
            console.log('RESPONSE CREATE: ', response.data.id);
            if (this.selectedFile) {
              this.toolFunctionService
                .postForFile(payload.name, this.selectedFile, response.data.id)
                .subscribe({
                  next: (response) => {
                    console.log('File berhasil diunggah:', response);
                  },
                  error: (error) => {
                    console.error('Error mengunggah file:', error);
                  },
                  complete: () => {
                    this.loadingService.hide();
                    this.modalService.dismissAll();
                  },
                });
            } else {
              console.log('Tidak ada file yang dipilih untuk diunggah.');
            }
          },
          complete: () => {
            if (!this.selectedFile) {
              this.loadingService.hide();
              this.modalService.dismissAll();
            }
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
            this.loadingService.hide();
            console.error('Error creating new function:', error);
          },
        });
    }
  }

  fungsiIniMemilikiDokumen: boolean = false;

  openUpdate(id: number) {
    this.resetFormAndData();
    this.toolFunctionService.getToolFunction(id).subscribe({
      next: (response: any) => {
        if (response.data && response.data.function) {
          const funcData = response.data.function;
          this.fungsiIniMemilikiDokumen = funcData.document;

          const propertiesFormGroups = Object.keys(
            funcData.parameters.properties
          ).map((key) => {
            const prop = funcData.parameters.properties[key];
            return this.fb.group({
              key: [{ value: key, disabled: this.fungsiIniMemilikiDokumen }],
              type: [
                { value: prop.type, disabled: this.fungsiIniMemilikiDokumen },
              ],
              description: [prop.description],
            });
          });

          this.form = this.fb.group({
            id: funcData.id,
            name: funcData.name,
            description: funcData.description,
            properties: this.fb.array(propertiesFormGroups),
            required: this.fb.array(funcData.parameters.required || []),
          });

          if (this.fungsiIniMemilikiDokumen) {
            this.updateRequired({ target: { checked: true } }, 'query');
          }

          this.modalService.open(this.updateModal);
        } else {
          console.error('Unexpected response structure:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching data for update:', error);
      },
    });
  }

  openSystemPrompt() {
    this.modalService.open(this.systemPromptModal);
    this.newSystemPrompt = this.systemPrompt;
  }

  updateSystemPrompt() {
    this.toolFunctionService
      .updateSystemPrompt(this.newSystemPrompt)
      .subscribe({
        next: (resp: any) => {
          console.log(resp);
        },
        error: (error) => {
          this.loadingService.hide();
          console.error(error);
        },
        complete: () => {
          this.loadingService.hide();
          this.modalService.dismissAll();
          this.toolFunctionService.getSystemPrompt().subscribe({
            next: (resp: any) => {
              this.systemPrompt = resp;
            },
          });
        },
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
    this.resetFormAndData();
    this.form = this.fb.group({
      name: '',
      description: '',
      properties: this.fb.array([
        this.fb.group({
          key: '',
          type: 'string',
          description: '',
        }),
      ]),
      required: this.fb.array([]),
      hasDocument: [false],
    });

    this.modalService.open(this.createModal);
  }

  createFunction(): void {
    if (this.form.valid) {
      this.loadingService.show();

      const formValue = this.form.getRawValue();
      // Membuat objek 'properties' dari array 'properties'
      const propertiesObj: { [key: string]: any } = {};
      formValue.properties.forEach((prop: any) => {
        propertiesObj[prop.key] = {
          type: prop.type,
          description: prop.description,
        };
      });

      const payload = {
        name: formValue.name,
        description: formValue.description,
        properties: propertiesObj,
        required: formValue.required,
        document: this.selectedFile != null,
      };

      console.log('PAYLOAD : ', payload);

      this.toolFunctionService.createToolFunction(payload).subscribe({
        next: (response: any) => {
          console.log('RESPONSE CREATE: ', response.data.id);
          if (this.selectedFile) {
            this.toolFunctionService
              .postForFile(payload.name, this.selectedFile, response.data.id)
              .subscribe({
                next: (response) => {
                  console.log('File berhasil diunggah:', response);
                },
                error: (error) => {
                  console.error('Error mengunggah file:', error);
                },
                complete: () => {
                  this.loadingService.hide();
                  this.modalService.dismissAll();
                },
              });
          } else {
            console.log('Tidak ada file yang dipilih untuk diunggah.');
          }
        },
        complete: () => {
          if (!this.selectedFile) {
            this.loadingService.hide();
            this.modalService.dismissAll();
          }
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
          this.loadingService.hide();
          console.error('Error creating new function:', error);
        },
      });
    }
  }

  resetFormAndData(): void {
    this.selectedFile = null;
    this.form.reset();

    this.form.patchValue({
      name: '',
      description: '',
      hasDocument: false,
    });

    this.form.setControl('properties', this.fb.array([]));
  }
}
