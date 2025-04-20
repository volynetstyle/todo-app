import { AbstractControl, ValidatorFn } from '@angular/forms';

export function matchValidator(controlName: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const controlToMatch = control.parent?.get(controlName);

    return controlToMatch && control.value !== controlToMatch.value
      ? { mismatch: true }
      : null;
  };
}
