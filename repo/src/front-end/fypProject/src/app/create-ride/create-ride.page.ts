import { Component, Inject, Input, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { IDatabaseInterface, IRide } from '../database.interface';
import { DATABASE_SERVICE_TOKEN } from '../mockDatabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-ride',
  templateUrl: './create-ride.page.html',
  styleUrls: ['./create-ride.page.scss'],
})
export class CreateRidePage implements OnInit {

  //Boolean
  makeCreateRideButtonVisible: boolean = true;
  makeCancelRideButtonVisible: boolean = false;
  makeLeaveButtonVisible: boolean = true;

  makeRideStatusVisible: boolean = false;
  @Input() hasActiveStatus: boolean = false; 
  makeLookingForRiderProgressVisible: boolean = false;
  disableInputButton: boolean = false;

  //Ride object
  ride: IRide;
  currentDriver: any;

  //Ride fields
  rideEmail: string;
  numberOfSeats: number;
  direction: string;
  locationAtCollege: string;
  locationOutsideOfCollege: string;

  //Options for directions and meetup locations
  directions: string[] = ['To Campus', 'From Campus'];
  locationsAtCollege: string[] = ['Front Entrance', 'Nothern Entrance', 'Southern Entrance', 'West Entrance'];  // Example locations
  locationsOutsideOfCollege: string;

  currentRide: any;

  ngOnInit(): void {
    //Clear rides data for testing purposes
    //this.databaseInterface.clearRidesData();

    //Refresh data
    this.databaseInterface.refreshData();

    this.currentDriver = this.databaseInterface.getCurrentDriver();

    //Retrieve the currentRide
    this.currentRide = this.databaseInterface.getCurrentRide();

    //Assign the currentRide details to the fields
    if (this.currentRide) {
      this.assignCurrentRideValuesToFormFields();
    }

    this.printListOfRidesToConsole();
  }

  constructor(private alertController: AlertController, @Inject(DATABASE_SERVICE_TOKEN) private databaseInterface: IDatabaseInterface, private router: Router) { }

  async simulateRiderFound() {
    // Simulate waiting for 5 seconds to find a rider
    setTimeout(async () => {
      const alert = await this.alertController.create({
        header: 'Rider Found!',
        message: 'A rider has applied for your ride. Do you want to accept the ride request?',
        buttons: [
          {
            text: 'Reject',
            role: 'cancel',
            handler: () => {
              console.log('Ride request rejected');
            }
          },
          {
            text: 'Accept',
            handler: () => {
              console.log('Ride request accepted');
              this.hasActiveStatus = true; // Ride becomes active
              this.makeLookingForRiderProgressVisible = false; // Stop showing the progress
            }
          }
        ]
      });
      await alert.present();
    }, 5000);
  }

  setBooleanValuesInDatabase(makeCreateRideButtonVisible: boolean, makeCancelRideButtonVisible: boolean, makeRideStatusVisible: boolean, hasActiveStatus: boolean,
    makeLookingForRiderProgressVisible: boolean, disableInputButton: boolean) {
    this.makeCreateRideButtonVisible = makeCreateRideButtonVisible;
    this.makeCancelRideButtonVisible = makeCancelRideButtonVisible;
    this.makeRideStatusVisible = makeRideStatusVisible;
    this.hasActiveStatus = hasActiveStatus;
    this.makeLookingForRiderProgressVisible = makeLookingForRiderProgressVisible;
    this.disableInputButton = disableInputButton;
  }

  assignFormFieldsToBeEmpty() {
    this.numberOfSeats = 0;
    this.direction = '';
    this.locationAtCollege = '';
    this.locationOutsideOfCollege = '';
  }

  async confirmNewRide() {
    const alert = await this.alertController.create({
      header: 'Confirm New Ride',
      message: `Are you sure you want to create a ride with the following info?\nNumber of Seats: ${this.numberOfSeats},\nDirection: ${this.direction}, 
      \nLocation At College: ${this.locationAtCollege}\nLocation Outside College: ${this.locationOutsideOfCollege}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Ride creation cancelled');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            this.makeLeaveButtonVisible = false;
            this.setBooleanValuesInDatabase(false, true, true, false, true, true);
            this.assignRideFieldsToCurrentRide();
            this.databaseInterface.addRide(this.ride);
            this.simulateRiderFound();
            this.printListOfRidesToConsole();
          }
        }
      ]
    });
    await alert.present();
  }

  printListOfRidesToConsole() {
    console.log('List of Rides from college:')
    console.log(this.databaseInterface.retrieveListOfRidesFromCollege());
    console.log('List of Rides to college:')
    console.log(this.databaseInterface.retrieveListOfRidesToCollege());
  }

  async confirmCompletingRide() {
    const alert = await this.alertController.create({
      header: 'Confirm Completion of Ride',
      message: 'Are you sure you want to complete this ride?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.cancelRide();
          }
        }
      ]
    });
    await alert.present();
  }


  async cancelRide() {
    this.setBooleanValuesInDatabase(true, false, false, false, false, false);
    this.databaseInterface.cancelRide(this.rideEmail, this.direction);
    this.assignFormFieldsToBeEmpty();
    this.router.navigateByUrl('/home');
  }

  async confirmLeavePage() {
    const alert = await this.alertController.create({
      header: 'Leave Page?',
      message: 'If you leave, any created rides will be canceled. Continue?',
      buttons: [
        {
          text: 'Stay',
          role: 'cancel'
        },
        {
          text: 'Leave',
          handler: () => {
            this.cancelRide();
          }
        }
      ]
    });
    await alert.present();
  }

  assignCurrentRideValuesToFormFields() {
    this.rideEmail = this.currentRide.rideEmail;
    this.numberOfSeats = this.currentRide.numberOfSeats;
    this.direction = this.currentRide.direction;
    this.locationAtCollege = this.currentRide.locationAtCollege;
    this.locationOutsideOfCollege = this.currentRide.locationOutsideOfCollege;
    this.makeCreateRideButtonVisible = this.currentRide.createRideBool;
    this.makeCancelRideButtonVisible = this.currentRide.cancelRideBool;
    this.makeRideStatusVisible = this.currentRide.statusBool;
    this.hasActiveStatus = this.currentRide.activeStatusBool;
    this.makeLookingForRiderProgressVisible = this.currentRide.progressBool;
    this.disableInputButton = this.currentRide.disableInputButtonBool;
  }

  assignRideFieldsToCurrentRide() {
    this.ride = {
      driverName: this.currentDriver.name || '',
      rideEmail: this.databaseInterface.getCurrentUserEmail() as string ?? '',
      status: 'active',
      numberOfSeats: this.numberOfSeats,
      direction: this.direction,
      locationAtCollege: this.locationAtCollege,
      locationOutsideOfCollege: this.locationOutsideOfCollege,
      createRideBool: this.makeCreateRideButtonVisible,
      cancelRideBool: this.makeCancelRideButtonVisible,
      statusBool: this.makeRideStatusVisible,
      activeStatusBool: this.hasActiveStatus,
      progressBool: this.makeLookingForRiderProgressVisible,
      disableInputButtonBool: this.disableInputButton,
      dob: this.currentDriver.dob,
      gender: this.currentDriver.gender,
      courseDepartment: this.currentDriver.courseDepartment,
      personalTraits: this.currentDriver.personalTraits,
      personalHobbies: this.currentDriver.personalHobbies
    }
    alert('Ride created successfully');
  }

  showRideDetailsIfPresent() {
    if (this.rideEmail) {
      this.numberOfSeats = this.ride.numberOfSeats;
      this.locationAtCollege = this.ride.locationAtCollege;
      this.locationOutsideOfCollege = this.ride.locationOutsideOfCollege;
    }
  }

  async createRide() {
    if (this.numberOfSeats && this.direction && this.locationAtCollege && this.locationOutsideOfCollege) {
      this.confirmNewRide();
    } else {
      alert('Please fill in all fields');
    }
  }
}
