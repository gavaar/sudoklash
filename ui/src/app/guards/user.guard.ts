import { inject } from '@angular/core';
import { UserService } from '../services';
import { Observable, filter, map } from 'rxjs';

export const userGuard = (): Observable<boolean> => {
  const userService = inject(UserService);
  return userService.user$.pipe(filter(user => user != null), map(() => true));
};
