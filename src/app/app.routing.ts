import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {GameListComponent} from './gamelist/gamelist.component';
import {LobbyComponent} from './lobby/lobby.component';
import {MainMenuComponent} from './mainmenu/mainmenu.component';
import {CreateUserComponent} from './createuser/createuser.component'
import {GameComponent} from './game/game.component';
import {AuthGuardService} from './shared/services/auth-guard.service';


const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'createUser', component: CreateUserComponent },
    { path: '', component: MainMenuComponent, canActivate: [AuthGuardService] },
    { path: 'gameList', component: GameListComponent, canActivate: [AuthGuardService] },
    { path: 'gameLobby/:id', component: LobbyComponent, canActivate: [AuthGuardService] },
    { path: 'game/:id', component: GameComponent, canActivate: [AuthGuardService]},
    { path: 'test', component: GameComponent},
    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);
