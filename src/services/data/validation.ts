import {
  UpsertMessageInput,
  UpsertSubscriptionInput,
  UpsertUserInput,
} from './types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const assertNonEmpty = (value: string, label: string) => {
  if (!value.trim()) {
    throw new Error(`${label} is required`);
  }
};

export const validateUserInput = (input: UpsertUserInput) => {
  assertNonEmpty(input.email, 'Email');
  assertNonEmpty(input.name, 'Name');

  if (!emailPattern.test(input.email)) {
    throw new Error('Email must be valid');
  }
};

export const validateMessageInput = (input: UpsertMessageInput) => {
  assertNonEmpty(input.name, 'Name');
  assertNonEmpty(input.email, 'Email');
  assertNonEmpty(input.subject, 'Subject');
  assertNonEmpty(input.message, 'Message');

  if (!emailPattern.test(input.email)) {
    throw new Error('Email must be valid');
  }

  if (input.message.trim().length < 10) {
    throw new Error('Message must be at least 10 characters long');
  }
};

export const validateSubscriptionInput = (input: UpsertSubscriptionInput) => {
  assertNonEmpty(input.user_id, 'user_id');
  assertNonEmpty(input.plan_id, 'plan_id');

  if (!['active', 'canceled', 'past_due', 'trialing'].includes(input.status)) {
    throw new Error('Invalid subscription status');
  }
};
