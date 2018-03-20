import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase } from "angularfire2/database";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { TabsPage } from '../tabs/tabs';
import { CreatePage } from '../create/create';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private database: AngularFireDatabase,
    private barcodeScanner: BarcodeScanner,
    private auth: AuthService,
    private user: UserService,
  ) {

  }

  // TODO: error message plugin_not_found also fix plugman problem ffs -> plugins/cordova-universal-links-plugin/hooks/lib/ios/xcodePreferences.js
  login() {
    console.log(this.user.houseId);
    this.auth.signInWithFacebook().then(() => {
      this.user.retrieveUser().subscribe(user => {
        if (!!user.houseId) {
          this.navCtrl.setRoot(TabsPage);
        }
      });
    });
  }

  logout() {
    this.auth.signOut();
  }

  create() {
    this.navCtrl.push(CreatePage, {}, { animate: false });
    console.log('Create page');
  }

  scanHouseCode() {
    // TODO: needs testing on device
    console.log('Join house');
    this.barcodeScanner.scan().then(barcodeData => {
      const houseId = barcodeData.text;
      this.database.object('/users/' + this.user.id)
        .update({
          houseId: houseId,
        })
        .then(() => {
          const newUserRef = this.database.object(`/houses/${houseId}/users/${this.user.id}`);
          newUserRef.update({
            id: this.user.id,
            name: this.user.name
          });
          this.navCtrl.setRoot(TabsPage);
        });
    }, (err) => {
      alert('Error: ' + err);
    });
  }

  isAuthed() {
    return this.auth.authenticated;
  }

  getUserDetails() {
    return {
      name: this.user.name,
      image: this.user.image
    }
  }

}
