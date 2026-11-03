import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBooking, hasScheduleConflict, jakartaToday, isBookableService } from '../lib/booking-rules.ts';
const now = new Date('2026-10-23T03:00:00.000Z'); // 10:00 WIB
const valid = { customerName: '  Band  A  ', customerPhone: '0812-3456-7890', serviceId: 'clx0000000000000001', date: '2026-10-24', startTime: '14:00', durationHours: 2 };
test('Jakarta calendar day is used', () => assert.equal(jakartaToday(new Date('2026-10-23T18:00:00Z')), '2026-10-24'));
test('normalizes name and phone', () => { const result = validateBooking(valid, now); assert.equal(result.ok, true); if (result.ok) { assert.equal(result.value.customerName, 'Band A'); assert.equal(result.value.customerPhone, '081234567890'); }});
test('rejects invalid and past dates', () => { for (const date of ['2026-02-30','2026-10-22','2027-12-24']) assert.equal(validateBooking({...valid,date}, now).ok,false); });
test('rejects past same-day time and outside studio hours', () => { assert.equal(validateBooking({...valid,date:'2026-10-23',startTime:'09:30'}, now).ok,false); assert.equal(validateBooking({...valid,startTime:'22:30',durationHours:2}, now).ok,false); });
test('enforces half-hour increments and duration', () => { assert.equal(validateBooking({...valid,startTime:'14:15'}, now).ok,false); assert.equal(validateBooking({...valid,durationHours:0}, now).ok,false); });
test('detects overlapping sessions but accepts adjacent sessions', () => { const existing=[{startTime:'14:00',durationHours:2}]; assert.equal(hasScheduleConflict(existing,15*60,2),true); assert.equal(hasScheduleConflict(existing,16*60,1),false); assert.equal(hasScheduleConflict(existing,13*60,1),false); });
test('mixing is not bookable by hour', () => { assert.equal(isBookableService('Mixing & Mastering'),false); assert.equal(isBookableService('Studio Rehearsal'),true); });
