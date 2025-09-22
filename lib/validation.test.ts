import { describe, it, expect } from 'vitest';
import { voteSchema, createPollSchema, deletePollSchema } from './validation';

describe('voteSchema', () => {
  it('should validate a correct vote input', () => {
    const validVote = { optionId: 'option123', pollId: 'poll456' };
    expect(() => voteSchema.parse(validVote)).not.toThrow();
  });

  it('should throw an error for missing optionId', () => {
    const invalidVote = { pollId: 'poll456' };
    expect(() => voteSchema.parse(invalidVote)).toThrow();
  });

  it('should throw an error for missing pollId', () => {
    const invalidVote = { optionId: 'option123' };
    expect(() => voteSchema.parse(invalidVote)).toThrow();
  });

  it('should throw an error for empty optionId', () => {
    const invalidVote = { optionId: '', pollId: 'poll456' };
    expect(() => voteSchema.parse(invalidVote)).toThrow();
  });

  it('should throw an error for empty pollId', () => {
    const invalidVote = { optionId: 'option123', pollId: '' };
    expect(() => voteSchema.parse(invalidVote)).toThrow();
  });
});

describe('createPollSchema', () => {
  it('should validate a correct create poll input', () => {
    const validPoll = {
      question: 'What is your favorite color?',
      options: ['Red', 'Blue', 'Green'],
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(validPoll)).not.toThrow();
  });

  it('should throw an error for missing question', () => {
    const invalidPoll = {
      options: ['Red', 'Blue'],
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });

  it('should throw an error for question too long', () => {
    const invalidPoll = {
      question: 'a'.repeat(501),
      options: ['Red', 'Blue'],
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });

  it('should throw an error for less than 2 options', () => {
    const invalidPoll = {
      question: 'What is your favorite color?',
      options: ['Red'],
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });

  it('should throw an error for more than 10 options', () => {
    const invalidPoll = {
      question: 'What is your favorite color?',
      options: Array(11).fill('Option'),
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });

  it('should throw an error for empty option', () => {
    const invalidPoll = {
      question: 'What is your favorite color?',
      options: ['Red', ''],
      userId: 'user789',
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });

  it('should throw an error for missing userId', () => {
    const invalidPoll = {
      question: 'What is your favorite color?',
      options: ['Red', 'Blue'],
    };
    expect(() => createPollSchema.parse(invalidPoll)).toThrow();
  });
});

describe('deletePollSchema', () => {
  it('should validate a correct delete poll input', () => {
    const validDelete = { pollId: 'poll456' };
    expect(() => deletePollSchema.parse(validDelete)).not.toThrow();
  });

  it('should throw an error for missing pollId', () => {
    const invalidDelete = {};
    expect(() => deletePollSchema.parse(invalidDelete)).toThrow();
  });

  it('should throw an error for empty pollId', () => {
    const invalidDelete = { pollId: '' };
    expect(() => deletePollSchema.parse(invalidDelete)).toThrow();
  });
});