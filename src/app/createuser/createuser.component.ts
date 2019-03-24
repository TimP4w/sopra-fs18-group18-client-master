import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../shared/services/authentication.service';
import {Router} from '@angular/router';
import {User} from '../shared/models/user';

@Component({
  selector: 'app-createuser',
  templateUrl: './createuser.component.html',
  styleUrls: ['./createuser.component.css']
})
export class CreateUserComponent implements OnInit {
  model: any = {};
  loading = false;
  error = '';
  user: User;

  constructor(private router: Router, private _service: AuthenticationService, private _router: Router) {

  }

  ngOnInit() {
    this.user = new User();
  }

  //Helper function, check that username and name are valid all the time!
  verifyData() {
    if (this.user.name == null || this.user.username == null) {
      this.error = 'Name and/or username cannot be left blank';
      return false;
    }
    else if (! /^[a-zA-Z0-9\-\_]+$/.test(this.user.name) || ! /^[a-zA-Z0-9-_]+$/.test(this.user.username)) {
        // illegal character
      this.error = 'Allowed characters: a-z, A-Z, 0-9, -, _';
      return false;
    }
    else if ((this.user.name).length < 3 || (this.user.name).length > 15 || (this.user.username).length < 3 || (this.user.username).length > 15) {
      // name/username too long/short
      this.error = 'Name and username must contain between 3 and 15 characters';
      return false;
    }
    else {
      return true;
    }
  }

  create() {
    //Post new user to server, display loading...
    this.error = ''
    this.loading = true;
    if (this.verifyData()) {
      this._service.create(this.user)
        .subscribe(result => {
          if (result) {
            //Ok, go to /
            this.loading = false;
            this.router.navigate(['/login', {username: this.user.username}]);
          }
        },error=>{
          if (error) {
              this.error = error.error;
              this.loading = false;
          }
        });
    } else {
      //Turn off loading, can't post
      this.loading = false;
    }
  }

  clearfields() {
    this.error = ''
    this.user.name = null;
    this.user.username = null;
  }

  generateUsername() {
    let namelength = Math.floor(Math.random()*(9-5+1)+5);
    let voc = ['a','e','i','o','u',];
    let cons = ['b','c','d','f','g','h','j','k','l','n','m','p','qu','r','s','t','v','w','x','y','z'];
    let name = '';

    for (let i = 0; i < namelength; i++){
      if ( i % 2 == 0){
        name += voc[Math.floor(Math.random() * voc.length)]
      }
      if ( i % 2 != 0){
        name += cons[Math.floor(Math.random() * cons.length)]
      }
    }
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
  }

  genName() {
    this.user.name = this.generateUsername();
    this.user.username = this.generateUsername();
  }

  goToLogin() {
    this._router.navigate(['/login'])
  }
}
