import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('should resolve Tailwind conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('', null, undefined)).toBe('')
  })

  it('should handle nested arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with conditional classes', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
  })

  it('should combine multiple conditional classes', () => {
    expect(cn('base', { active: true, disabled: false }, 'extra')).toBe('base active extra')
  })

  it('should handle duplicate Tailwind classes and merge correctly', () => {
    expect(cn('text-sm text-lg text-xl')).toBe('text-xl')
  })

  it('should handle mixed conditional and static classes', () => {
    expect(cn('px-2', true && 'py-2', false && 'py-4', 'mx-2')).toBe('px-2 py-2 mx-2')
  })
})
