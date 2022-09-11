import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Customer } from '../../models/customer';
import { CustomersService } from '../../services/customer/customers.service';

@Component({
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.css'],
})
export class CustomerInfoComponent implements OnInit {
  selectedCustomerId!: number;
  customer!: Customer;
  customerToDelete!: Customer;
  displayBasic!: boolean;
  constructor(
    private activatedRoute: ActivatedRoute,
    private customerService: CustomersService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getCustomerById();
    this.checkIsActiveStatus();
  }

  checkIsActiveStatus() {
    this.messageService.clearObserver.subscribe((data) => {
      if (data == 'r') {
        this.messageService.clear();
      } else if (data == 'c') {
        let filteredData = this.customer.billingAccounts?.find((c) => {
          return c.status === 'active';
        });
        this.messageService.clear();
        if (filteredData) {
          this.messageService.add({
            key: 'okey',
            sticky: true,
            severity: 'warn',
            detail:
              'Since the customer has active products, the customer cannot be deleted',
          });
        } else {
          this.messageService.clear();
          this.removeCustomer();
        }
      }
    });
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
        });
    }
  }

  getCustomerId(customer: Customer) {
    this.router.navigateByUrl(`/update-customer/${customer.id}`);
  }
  removeCustomerPopup(customer: Customer) {
    this.customerToDelete = customer;
    this.messageService.add({
      key: 'c',
      sticky: true,
      severity: 'warn',
      detail: 'Are you sure to delete this customer?',
    });
  }

  removeCustomer() {
    this.customerService.delete(this.customerToDelete.id!).subscribe((data) => {
      this.messageService.add({
        key: 'etiya-custom',
        detail: 'This customer succesfully deleted',
      });
      this.router.navigateByUrl('/dashboard/customers/customer-dashboard');
    });
  }
}