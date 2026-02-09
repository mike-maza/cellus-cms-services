import { DomainError } from '../shared/errors/DomainError';

export class Email {
  private readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  get value(): string {
    return this._value;
  }

  private _value: string;

  static create(email: string): Email {
    if (!email) {
      throw new DomainError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new DomainError('Invalid email format');
    }

    return new Email(email.toLowerCase().trim());
  }

  toString(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}