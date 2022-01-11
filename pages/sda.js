const obj1 = {
  start: new Date(new Date('2020-07-19 18:15:00')),
  end: new Date(new Date('2020-07-19 18:20:00')),
};

const obj2 = {
  start: new Date(new Date('2020-07-19 18:25:00')),
  end: new Date(new Date('2020-07-19 18:20:00')),
};

const obj3 = {
  start: new Date(new Date('2020-07-19 18:45:00')),
  end: new Date(new Date('2020-07-19 18:55:00')),
};

const allTables = [
  {
    key: 2,
    tables: [
      { id: 20, reservedTimes: [obj1, obj2] },
      { id: 20, reservedTimes: [obj2, obj3] },
    ],
  },
];

const bla = allTables[0].tables.map((table) => {
  return table.reservedTimes.map((item) => {
    return item ? table : null;
  });
});

// console.log(bla);
const sto = { id: 40, name: 'misa', reservedTimes: [obj1, obj2] };

const prle = {
  ...sto,
  reservedTimes: [...sto.reservedTimes, obj3],
  name: 'pera',
};

console.log(prle);
