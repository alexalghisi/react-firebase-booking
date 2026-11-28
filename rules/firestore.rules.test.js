const { readFileSync } = require('node:fs');
const path = require('node:path');
const { after, before, beforeEach, describe, test } = require('node:test');
const {
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
    Timestamp,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    setLogLevel,
    updateDoc,
    where,
} = require('firebase/firestore');

const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':');

const booking = (overrides = {}) => ({
    title: 'Design review',
    date: '2030-05-14',
    time: '09:30',
    duration: 60,
    attendees: ['sam@example.com'],
    description: 'Board',
    status: 'confirmed',
    createdBy: 'alex',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
});

let env;

const alex = () => env.authenticatedContext('alex', { email: 'alex@example.com' }).firestore();
const sam = () => env.authenticatedContext('sam', { email: 'Sam@Example.com' }).firestore();
const eve = () => env.authenticatedContext('eve', { email: 'eve@example.com' }).firestore();
const guest = () => env.unauthenticatedContext().firestore();

const seed = (id, data) => env.withSecurityRulesDisabled((context) =>
    setDoc(doc(context.firestore(), 'bookings', id), data)
);

before(async () => {
    setLogLevel('silent');
    env = await initializeTestEnvironment({
        projectId: 'demo-booking',
        firestore: {
            host,
            port: Number(port),
            rules: readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
        },
    });
});

beforeEach(async () => {
    await env.clearFirestore();
    await seed('review', booking());
    await seed('private', booking({ title: 'Payroll', attendees: [] }));
});

after(async () => {
    await env.cleanup();
});

describe('reading bookings', () => {
    test('lets the owner read their booking', async () => {
        await assertSucceeds(getDoc(doc(alex(), 'bookings', 'private')));
    });

    test('lets an invited attendee read a booking, ignoring email case', async () => {
        await assertSucceeds(getDoc(doc(sam(), 'bookings', 'review')));
    });

    test('hides bookings from other users and guests', async () => {
        await assertFails(getDoc(doc(eve(), 'bookings', 'review')));
        await assertFails(getDoc(doc(guest(), 'bookings', 'review')));
    });

    test('allows the scoped queries the app runs', async () => {
        const owned = await assertSucceeds(
            getDocs(query(collection(alex(), 'bookings'), where('createdBy', '==', 'alex')))
        );
        if (owned.size !== 2) {
            throw new Error(`expected 2 owned bookings, got ${owned.size}`);
        }
        const shared = await assertSucceeds(
            getDocs(query(collection(sam(), 'bookings'), where('attendees', 'array-contains', 'sam@example.com')))
        );
        if (shared.size !== 1) {
            throw new Error(`expected 1 shared booking, got ${shared.size}`);
        }
    });

    test('rejects listing the whole collection or someone else\'s bookings', async () => {
        await assertFails(getDocs(collection(eve(), 'bookings')));
        await assertFails(getDocs(query(collection(eve(), 'bookings'), where('createdBy', '==', 'alex'))));
        await assertFails(
            getDocs(query(collection(eve(), 'bookings'), where('attendees', 'array-contains', 'sam@example.com')))
        );
    });
});

describe('creating bookings', () => {
    test('accepts a valid booking owned by the signed-in user', async () => {
        await assertSucceeds(setDoc(doc(alex(), 'bookings', 'new'), booking()));
    });

    test('accepts a booking without optional fields', async () => {
        const { description, createdAt, updatedAt, ...minimal } = booking();
        await assertSucceeds(setDoc(doc(alex(), 'bookings', 'minimal'), minimal));
    });

    test('refuses guests and bookings created for someone else', async () => {
        await assertFails(setDoc(doc(guest(), 'bookings', 'new'), booking()));
        await assertFails(setDoc(doc(eve(), 'bookings', 'new'), booking()));
    });

    const invalid = {
        'an empty title': { title: '' },
        'a title over 200 characters': { title: 'x'.repeat(201) },
        'a malformed date': { date: '14/05/2030' },
        'an impossible month': { date: '2030-13-01' },
        'a malformed time': { time: '9:30' },
        'an out of range hour': { time: '24:00' },
        'a fractional duration': { duration: 30.5 },
        'a zero duration': { duration: 0 },
        'a duration over a day': { duration: 1441 },
        'attendees that are not a list': { attendees: 'sam@example.com' },
        'more than 50 attendees': { attendees: Array.from({ length: 51 }, (_, i) => `p${i}@example.com`) },
        'an unknown status': { status: 'approved' },
        'a description over 2000 characters': { description: 'x'.repeat(2001) },
        'a string timestamp': { createdAt: '2030-05-14' },
        'an unexpected field': { isAdmin: true },
    };

    Object.entries(invalid).forEach(([label, overrides]) => {
        test(`rejects ${label}`, async () => {
            await assertFails(setDoc(doc(alex(), 'bookings', 'bad'), booking(overrides)));
        });
    });

    test('rejects a booking missing a required field', async () => {
        const { status, ...withoutStatus } = booking();
        await assertFails(setDoc(doc(alex(), 'bookings', 'bad'), withoutStatus));
    });
});

describe('changing bookings', () => {
    test('lets the owner edit and delete their booking', async () => {
        await assertSucceeds(updateDoc(doc(alex(), 'bookings', 'review'), { status: 'cancelled' }));
        await assertSucceeds(deleteDoc(doc(alex(), 'bookings', 'review')));
    });

    test('stops attendees and strangers from editing or deleting', async () => {
        await assertFails(updateDoc(doc(sam(), 'bookings', 'review'), { title: 'Hijacked' }));
        await assertFails(deleteDoc(doc(sam(), 'bookings', 'review')));
        await assertFails(updateDoc(doc(eve(), 'bookings', 'review'), { title: 'Hijacked' }));
        await assertFails(deleteDoc(doc(eve(), 'bookings', 'review')));
    });

    test('stops the owner from handing a booking to someone else', async () => {
        await assertFails(updateDoc(doc(alex(), 'bookings', 'review'), { createdBy: 'eve' }));
    });

    test('keeps validating fields on edit', async () => {
        await assertFails(updateDoc(doc(alex(), 'bookings', 'review'), { time: 'noon' }));
    });
});

describe('other collections', () => {
    test('denies everything outside bookings', async () => {
        await assertFails(setDoc(doc(alex(), 'users', 'alex'), { role: 'admin' }));
        await assertFails(getDoc(doc(alex(), 'users', 'alex')));
    });
});
