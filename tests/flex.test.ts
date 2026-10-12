import {describe,expect,it} from 'vitest';
import {FlexSystem} from '../src/game/core/flex';
describe('manual FLEX Ultimate',()=>{
 it('starts in farming, requires full Aura, and activates exactly once',()=>{
  const f=new FlexSystem();expect(f.state).toBe('farming');
  f.sync(10,99);expect(f.isReady()).toBe(false);
  expect(f.activate(10,99,'alpha')).toBe(false);
  f.sync(10,100);expect(f.state).toBe('ready');
  expect(f.activate(10,100,'alpha')).toBe(true);
  expect(f.activate(11,100,'sigma')).toBe(false);
  expect(f.state).toBe('active');expect(f.variant).toBe('alpha');
  expect(f.remaining(2500)).toBe(2510);
 });
 it('freezes on simulation time and expires exactly at end boundary',()=>{
  const f=new FlexSystem();f.sync(0,100);f.activate(0,100,'rizz');
  expect(f.isActive(4999)).toBe(true);expect(f.progress(2500)).toBeCloseTo(.5);
  f.sync(5000,0);expect(f.state).toBe('farming');
  expect(f.isActive(5000)).toBe(false);expect(f.remaining(5000)).toBe(0);
 });
});
