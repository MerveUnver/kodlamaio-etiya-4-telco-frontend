import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  templateUrl: './update-customer.component.html',
  styleUrls: ['./update-customer.component.css'],
})
export class UpdateCustomerComponent implements OnInit {
  updateCustomerForm!: FormGroup;
  selectedCustomerId!: number;
  customer!: Customer;
  isShow:Boolean=false
  under18: Boolean = false;
  futureDate: Boolean = false;
  today: Date = new Date();
  nationalityId: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomersService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getCustomerById();
  }
  createFormUpdateCustomer() {
    console.log(this.customer.birthDate);
    let bDate = new Date();
    if (this.customer.birthDate) {
      bDate = new Date(this.customer.birthDate);
    }
    this.updateCustomerForm = this.formBuilder.group({
      firstName: [this.customer.firstName, Validators.required],
      middleName: [this.customer.middleName],
      lastName: [this.customer.lastName, Validators.required],
      birthDate: [
        formatDate(new Date(bDate), 'yyyy-MM-dd', 'en'),
        Validators.required,
      ],
      gender: [this.customer.gender, Validators.required],
      fatherName: [this.customer.fatherName],
      motherName: [this.customer.motherName],
      nationalityId: [
        this.customer.nationalityId,
        [Validators.pattern('^[0-9]{11}$'), Validators.required],
      ],
    });
  }
  checkInvalid() {
    if (this.updateCustomerForm.invalid) {
      this.isShow = true;
      return;
    }
    let date = new Date(this.updateCustomerForm.get('birthDate')?.value);
    let age = this.today.getFullYear() - date.getFullYear();
    if (age < 18) {
      this.under18 = true;
      return;
    } else {
      this.under18 = false;
    }
    if (
      this.updateCustomerForm.value.nationalityId ===
      this.customer.nationalityId
    ) {
      this.updateCustomer();
    } else {
      this.checkTcNum(this.updateCustomerForm.value.nationalityId);
    }
  }
  getCustomerById() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) this.selectedCustomerId = params['id'];
    });
    if (this.selectedCustomerId == undefined) {
      //toast
    } else {
      this.customerService
        .getCustomerById(this.selectedCustomerId)
        .subscribe((data) => {
          this.customer = data;
          this.createFormUpdateCustomer();
        });
    }
  }

  updateCustomer() {
    if (this.updateCustomerForm.invalid) {
      this.isShow = true;
    } else {
      this.isShow = false;
      const customer: Customer = Object.assign(
        { id: this.customer.id },
        this.updateCustomerForm.value
      );
      this.customerService.update(customer, this.customer).subscribe(() => {
        this.router.navigateByUrl(
          `/dashboard/customers/customer-info/${customer.id}`
        );
        this.messageService.add({
          detail: 'Sucsessfully updated',
          severity: 'success',
          summary: 'Update',
          key: 'etiya-custom',
        });
      });
    }
  }

  checkTcNum(id: number) {
    this.customerService.getList().subscribe((response) => {
      let matchCustomer = response.find((item) => {
        return item.nationalityId == id;
      });
      if (matchCustomer) {
        this.nationalityId = true;
      } else {
        this.updateCustomer();
        this.nationalityId = false;
      }
    });
  }
  update() {
    this.checkInvalid();
  }

  isNumber(event: any): boolean {
    console.log(event);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }

  previousPage(){
    this.router.navigateByUrl(`/dashboard/customers/customer-info/${this.selectedCustomerId}`)

  }
  onDateChange(event: any) {
    let date = new Date(event.target.value);
    if (date.getFullYear() > this.today.getFullYear()) {
      this.updateCustomerForm.get('birthDate')?.setValue('');
      this.futureDate = true;
    } else {
      this.futureDate = false;
    }
  }
}
