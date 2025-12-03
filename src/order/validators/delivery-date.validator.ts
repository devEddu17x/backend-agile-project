import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsValidDeliveryDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDeliveryDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (!value) {
            return false;
          }

          const deliveryDate = new Date(value);
          const today = new Date();

          today.setHours(0, 0, 0, 0);
          deliveryDate.setHours(0, 0, 0, 0);

          const minDate = new Date(today);
          minDate.setDate(today.getDate() + 7);

          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + 60);

          return deliveryDate >= minDate && deliveryDate <= maxDate;
        },
        defaultMessage() {
          const today = new Date();
          const minDate = new Date(today);
          minDate.setDate(today.getDate() + 7);
          const maxDate = new Date(today);
          maxDate.setDate(today.getDate() + 60);

          return `Delivery date must be between ${minDate.toISOString().split('T')[0]} and ${maxDate.toISOString().split('T')[0]} (7 to 60 days from today)`;
        },
      },
    });
  };
}
