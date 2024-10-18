import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { AnswerType, BlockType } from 'src/constants/types';

export function ResponseValue(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'responseValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const type: BlockType = (args.object as any)['type'] as BlockType;
          const answerType: AnswerType = (args.object as any)[
            'answerType'
          ] as AnswerType;

          const required = (args.object as any)['required'] as boolean;

          if (!required && value === null) {
            return true;
          }

          switch (type) {
            case 'TEXT':
            case 'IMAGE':
            case 'VIDEO':
            case 'AUDIO':
            case 'GENERIC_EMBED':
            case 'SPACER':
              return true;
            case 'ADDRESS':
            case 'NAME':
              return typeof value === 'object';
            case 'MULTI_CHOICE':
            case 'PICTURE_CHOICE':
              if (answerType === 'RADIO') {
                return typeof value === 'string';
              } else if (answerType === 'CHECKBOX') {
                return (
                  Array.isArray(value) &&
                  value.every((v) => typeof v === 'string')
                );
              }
              return false;
            case 'MATRIX':
              return (
                Array.isArray(value) &&
                value.every((v) => {
                  if (answerType === 'RADIO') {
                    return typeof v === 'string';
                  } else if (answerType === 'CHECKBOX') {
                    return typeof v === 'string';
                  } else if (answerType === 'TEXT_BOX') {
                    return typeof v === 'object';
                  } else if (answerType === 'NUMBER') {
                    return typeof v === 'object';
                  }
                })
              );
            case 'FILE_UPLOAD':
              return (
                Array.isArray(value) &&
                value.every((v) => typeof v === 'object')
              );
            case 'LOCATION':
            case 'SIGNATURE':
            case 'DROP_DOWN':
            case 'SCALE_RATING':
            case 'SHORT_TEXT':
            case 'LONG_TEXT':
            case 'NUMBER':
            case 'EMAIL':
            case 'PHONE':
            case 'LINK':
            case 'DATE':
            case 'TIME':
              return typeof value === 'string';
            default:
              return false;
          }
        },
      },
    });
  };
}
