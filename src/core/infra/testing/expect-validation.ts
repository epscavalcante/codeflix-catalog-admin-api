// import EntityValidationError from "../../domain/exceptions/entity-validation-error.exception";
// import { FieldErrors, IValidator } from "../../domain/validators/validator"
// import exp from "constants";

// type ExpectedType = 
// |   {
//         validator: IValidator<any>; 
//         data: any;
//     }
// | (() => any);

// expect.extend({
//     containsErrorMessage(expected: ExpectedType, received: FieldErrors) {
//         if (typeof expected === 'function') {
//             try {
//                 expected();
//                 return isValid();
//             } catch (error) {
//                 const err = error as EntityValidationError;

//                 return assertContainsErrorsMessage(err.error, received);
//             }
//         } else {
//             const {validator, data} = expected;
//             const validated = validator.validate(data);

//             if (validated) {
//                 return isValid();
//             }

//             return assertContainsErrorsMessage(validator.errors, received);         
//         }
//     }
// })

// function assertContainsErrorsMessage(expected: FieldErrors, received: FieldErrors) {
//     const isMatch = expect.objectContaining(received) .asymmetricMatch(expected);

//     return isMatch
//         ? isValid()
//         : {
//             pass: false,
//             message: () => `The validation error not contains ${JSON.stringify(received)}. Current: ${JSON.stringify(expected)}`
//         }
// }

// function isValid() {
//     return {
//         pass: true,
//         message: () => ''
//     };
// }