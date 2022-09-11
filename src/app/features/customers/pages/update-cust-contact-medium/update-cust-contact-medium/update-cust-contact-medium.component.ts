import { ContactMedium } from './../../../models/contactMedium';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Customer } from '../../../models/customer';
import { CustomersService } from '../../../services/customer/customers.service';

@Component({
  templateUrl: './update-cust-contact-medium.component.html',
  styleUrls: ['./update-cust-contact-medium.component.css'],
})
export class UpdateCustContactMediumComponent implements OnInit {
  updateCustomerContactForm!: FormGroup;
  selectedCustomerId!: number;
  isShow: Boolean = false;
  updateContactMedium!:ContactMedium;

  customer!:Customer;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private customersService: CustomersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCustomerById();
  }

  createFormUpdateContactCustomer() {
    this.updateCustomerContactForm = this.formBuilder.group({
      email: [this.customer.contactMedium?.email, [Validators.required, Validators.email]],
      homePhone: [this.customer.contactMedium?.homePhone, Validators.pattern('^[0-9]{11}$')],
      mobilePhone: [
        this.customer.contactMedium?.mobilePhone,
        [Validators.pattern('^[0-9]{11}$'), Validators.required],
      ],
      fax: [this.customer.contactMedium?.fax, Validators.pattern('^[0-9]{11}$')],
    });
  }
  getCustomerById() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) this.selectedCustomerId = params['id'];
      console.log(this.selectedCustomerId);
    });
    if (this.selectedCustomerId == undefined) {
      this.messageService.add({
        detail: 'Customer not found!...',
        severity: 'danger',
        summary: 'error',
        key: 'etiya-custom',
      });
    } else {
      this.customersService
        .getCustomerById(this.selectedCustomerId)
        .subscribe((data) => {
          this.customer = data;
          this.createFormUpdateContactCustomer();
        });
    }
  }
  update() {
    if (this.updateCustomerContactForm.invalid) {
      this.messageService.add({
        detail: 'Please fill required areas!',
        severity: 'danger',
        summary: 'error',
        key: 'etiya-custom',
      });
      return;
    }
    if (this.updateCustomerContactForm.value.homePhone) {
      var homePhone = this.updateCustomerContactForm.value.homePhone.toString();
    }
    if (this.updateCustomerContactForm.value.mobilePhone) {
      var mobilePhone =
        this.updateCustomerContactForm.value.mobilePhone.toString();
    }
    if (this.updateCustomerContactForm.value.fax) {
      var fax = this.updateCustomerContactForm.value.fax.toString();
    }

    const newContactForm = {
      ...this.updateCustomerContactForm.value,
      homePhone: homePhone,
      mobilePhone: mobilePhone,
      fax: fax,
    };
    this.customersService
      .updateContactMedium(newContactForm, this.customer)
      .subscribe(() => {
        this.router.navigateByUrl(
          `/dashboard/customers/customer-contact-medium/${this.customer.id}`
        );
        this.messageService.add({
          detail: 'Sucsessfully updated',
          severity: 'success',
          summary: 'Update',
          key: 'etiya-custom',
        });
      });
  }
  isValid(event: any): boolean {
    console.log(event);
    const pattern = /[0-9]/;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);
    if (pattern.test(char)) return true;

    event.preventDefault();
    return false;
  }
}