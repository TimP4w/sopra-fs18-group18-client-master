import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../shared/services/authentication.service';
import {Router, ActivatedRoute} from '@angular/router';
import {User} from '../shared/models/user';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  error = '';
  user: User;
  username: string;

  constructor(private _service: AuthenticationService, private _router: Router, private _activatedRoute: ActivatedRoute) {

  }

  ngOnInit() {
    // reset login status
    this._service.logout();
    this.user = new User();

    let username = this._activatedRoute.snapshot.params['username'];
    if (username) {
      this.user.username = username;
    }

  }

  login() {
    this.loading = true; //set loading to true (diplay message or gif)
    this._service.login(this.user)
      .subscribe(
        result => {
        if (result) {
          this.loading = false;
          //user logged in -> go to /menu
          this._router.navigate(['/']);
        }
      },error=>{
        if (error) {
            this.error = error.error;
            this.loading = false;
        }
      });
  }

  goToCreateUser() {
    this._router.navigate(['/createUser'])
  }

  pressEnter(event) {
    if (event.keyCode == 13) {
      this.login()
    }
  }
}
