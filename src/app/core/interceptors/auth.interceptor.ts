import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('x-auth-token', token)
    });
    return next(clonedReq);
  }
  
  return next(req);
};
