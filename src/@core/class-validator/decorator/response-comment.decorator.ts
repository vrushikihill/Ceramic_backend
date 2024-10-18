import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function ResponseComment(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'responseComment',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const comment = (args.object as any)['comment'] as boolean;
          const commentRequired = (args.object as any)[
            'commentRequired'
          ] as boolean;

          if (!comment) {
            return true;
          }

          if (
            !commentRequired &&
            (value === null || typeof value === 'string')
          ) {
            return true;
          }

          if (commentRequired && typeof value === 'string') {
            return true;
          }

          return false;
        },
      },
    });
  };
}
