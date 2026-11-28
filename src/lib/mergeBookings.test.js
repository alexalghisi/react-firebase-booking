import mergeBookings from './mergeBookings';

test('combines lists and keeps the first copy of a booking', () => {
    const owned = [{ id: 'a', title: 'Owned' }, { id: 'b', title: 'Both' }];
    const shared = [{ id: 'b', title: 'Both again' }, { id: 'c', title: 'Shared' }];

    expect(mergeBookings(owned, shared)).toEqual([
        { id: 'a', title: 'Owned' },
        { id: 'b', title: 'Both' },
        { id: 'c', title: 'Shared' },
    ]);
});

test('skips empty entries and records without an id', () => {
    expect(mergeBookings([null, { title: 'No id' }], undefined, [{ id: 'x' }])).toEqual([{ id: 'x' }]);
});

test('returns an empty list when nothing is passed', () => {
    expect(mergeBookings()).toEqual([]);
});
