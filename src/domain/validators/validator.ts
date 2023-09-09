import { validateSync } from "class-validator";

export type FieldErrors = {
    [field: string]: string[]
}

export interface IValidator<PropsValidated> {
    errors: FieldErrors | null;
    validatedData: PropsValidated | null;
    validate(data: any): boolean;
}

export abstract class Validator<PropsValidated> implements IValidator<PropsValidated>{
    errors: FieldErrors | null = null;
    validatedData: PropsValidated | null = null;

    validate(data: any): boolean {
        const errors = validateSync(data);

        if(errors.length) {
            this.errors = {}

            for(const error of errors) {
                const field = error.property;
                
                this.errors[field] = Object.values(error.constraints!);
            }
        } else {
            this.validatedData = data;
        }

        return !errors.length;
    }
}